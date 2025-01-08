import { fetchAllSearchResults } from '../../utilities/elasticsearch'
import { mergeOverlappingRegions } from '../../utilities/region'
import { lookupExonsByGeneId } from '../types/exon'
import shapeMitoVariantSummary from './shapeMitoVariantSummary'
import mergeMitoVariants from './mergeMitoVariants'

const fetchMitoVariantsByGene = async (ctx, geneId, canonicalTranscriptId, subset) => {
  const geneExons = await lookupExonsByGeneId(ctx.database.gnomad, geneId)
  const filteredRegions = geneExons.filter(exon => exon.feature_type === 'CDS')
  const sortedRegions = filteredRegions.sort((r1, r2) => r1.xstart - r2.xstart)
  const padding = 75
  const paddedRegions = sortedRegions.map(r => ({
    ...r,
    start: r.start - padding,
    stop: r.stop + padding,
    xstart: r.xstart - padding,
    xstop: r.xstop + padding,
  }))

  const mergedRegions = mergeOverlappingRegions(paddedRegions)

  const rangeQueries = mergedRegions.map(region => ({
    range: {
      pos: {
        gte: region.start,
        lte: region.stop,
      },
    },
  }))

  const hits = await fetchAllSearchResults(ctx.database.elastic, {
    index: 'spark_mito',
    size: 10000,
    _source: [
      'alt',
      'chrom',
      'pos',
      'ref',
      'sortedTranscriptConsequences',
      'variant_id',
      'xpos',
      'ac',
      'ac_het',
      'ac_hom',
      'an',
      'af',
      'max_heteroplasmy',
      'filters',
    ],
    body: {
      query: {
        bool: {
          filter: [
            {
              nested: {
                path: 'sortedTranscriptConsequences',
                query: {
                  term: { 'sortedTranscriptConsequences.gene_id': geneId },
                },
              },
            },
            { bool: { should: rangeQueries } },
            { range: { ['ac']: { gt: 0 } } },
          ],
        },
      },
      sort: [{ pos: { order: 'asc' } }],
    },
  })

  const sparkVariants = hits.map(shapeMitoVariantSummary({ type: 'gene', geneId }))

  const ssc_hits = await fetchAllSearchResults(ctx.database.elastic, {
    index: 'ssc_mito',
    size: 10000,
    _source: [
      'alt',
      'chrom',
      'pos',
      'ref',
      'sortedTranscriptConsequences',
      'variant_id',
      'xpos',
      'ac',
      'ac_het',
      'ac_hom',
      'an',
      'af',
      'max_heteroplasmy',
      'filters',
    ],
    body: {
      query: {
        bool: {
          filter: [
            {
              nested: {
                path: 'sortedTranscriptConsequences',
                query: {
                  term: { 'sortedTranscriptConsequences.gene_id': geneId },
                },
              },
            },
            { bool: { should: rangeQueries } },
            { range: { ['ac']: { gt: 0 } } },
          ],
        },
      },
      sort: [{ pos: { order: 'asc' } }],
    },
  })

  const sscVariants = ssc_hits.map(shapeMitoVariantSummary({ type: 'gene', geneId }))

  const allVariants = mergeMitoVariants(sparkVariants, sscVariants)
  return allVariants

}

export default fetchMitoVariantsByGene
