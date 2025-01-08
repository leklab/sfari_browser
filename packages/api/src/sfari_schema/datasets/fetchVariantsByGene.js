import { fetchAllSearchResults } from '../../utilities/elasticsearch'
import { mergeOverlappingRegions } from '../../utilities/region'
import { lookupExonsByGeneId } from '../types/exon'
import fetch from 'node-fetch'
import mergeSfariAndGnomadVariantSummaries from './mergeSfariAndGnomadVariants'
import mergeExomeAndGenomeVariantSummaries from './mergeExomeAndGenomeVariants'
import mergeSSCVariants from './mergeSSCVariants'
import shapeGnomadVariantSummary from './shapeGnomadVariantSummary'

const annotateVariantsWithDenovoFlag = (variants, dnms) => {
  const dnmsVariantIds = new Set(dnms.reduce((acc, dnms) => acc.concat(dnms.variant_id), []))

  variants.forEach(variant => {
    if (dnmsVariantIds.has(variant.variantId)) {
      variant.flags.push('denovo')
    }
  })

  return variants
}

const annotateVariantsWithFuncFlag = (variants, func_data) => {
  const funcDataIds = new Set(func_data.reduce((acc, func_data) => acc.concat(func_data.variant), []))

  variants.forEach(variant => {
    if (funcDataIds.has(variant.variantId)) {
      variant.flags.push('func')
    }
  })

  return variants
}

const fetchDenovos = async (ctx, geneId) => {
  const hits = await fetchAllSearchResults(ctx.database.elastic, {
    index: 'autism_dnms',
    size: 10000,
    _source: [
      'variant_id',
      'high_confidence_dnm',
    ],
    body: {
      query: {
        bool: {
          filter: [
            { term: { ANN_GENEID: geneId } },
          ],
        },
      },
      sort: [{ POS: { order: 'asc' } }],
    },
  })

  return hits.map(hit => hit._source) // eslint-disable-line no-underscore-dangle
}

const fetchFunctionalData = async (ctx, geneId) => {
  const hits = await fetchAllSearchResults(ctx.database.elastic, {
    index: 'mavedb',
    size: 10000,
    _source: [
      'variant',
      'score',
    ],
    body: {
      query: {
        bool: {
          filter: [
            { term: { gene_id: geneId } },
          ],
        },
      },
      sort: [{ pos: { order: 'asc' } }],
    },
  })

  return hits.map(hit => hit._source) // eslint-disable-line no-underscore-dangle
}

const fetchVariantsByGene = async (ctx, geneId, canonicalTranscriptId, subset) => {
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
    index: 'spark_exomes_test',
    size: 10000,
    _source: [
      'AC_adj',
      'AN_adj',
      'nhomalt_adj',
      'alt',
      'chrom',
      'filters',
      'flags',
      'pos',
      'ref',
      'rsid',
      'sortedTranscriptConsequences',
      'variant_id',
      'xpos',
      'AC',
      'AN',
      'AF',
      'nhomalt',
      'AC_raw',
      'AN_raw',
      'AF_raw',
      'nhomalt_raw',
      'AC_proband',
      'AN_proband',
      'AF_proband'
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
            { range: { ['AC']: { gt: 0 } } },

          ],
        },
      },
      sort: [{ pos: { order: 'asc' } }],
    },
  })

  const exomeVariants = hits.map(shapeGnomadVariantSummary({ type: 'gene', geneId }))

  const ghits = await fetchAllSearchResults(ctx.database.elastic, {
    index: 'spark_genomes',
    size: 10000,
    _source: [
      'AC_adj',
      'AN_adj',
      'nhomalt_adj',
      'alt',
      'chrom',
      'filters',
      'flags',
      'pos',
      'ref',
      'rsid',
      'sortedTranscriptConsequences',
      'variant_id',
      'xpos',
      'AC',
      'AN',
      'AF',
      'nhomalt',
      'AC_raw',
      'AN_raw',
      'AF_raw',
      'nhomalt_raw',
      'AC_proband',
      'AN_proband',
      'AF_proband'
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
            { range: { ['AC_raw']: { gt: 0 } } },
          ],
        },
      },
      sort: [{ pos: { order: 'asc' } }],
    },
  })

  const genomeVariants = ghits.map(shapeGnomadVariantSummary({ type: 'gene', geneId }))
  const sparkVariants = mergeExomeAndGenomeVariantSummaries(exomeVariants, genomeVariants)

  const ssc_ghits = await fetchAllSearchResults(ctx.database.elastic, {
    index: 'ssc_genomes',
    size: 10000,
    _source: [
      'AC_adj',
      'AN_adj',
      'nhomalt_adj',
      'alt',
      'chrom',
      'filters',
      'flags',
      'pos',
      'ref',
      'rsid',
      'sortedTranscriptConsequences',
      'variant_id',
      'xpos',
      'AC',
      'AN',
      'AF',
      'nhomalt',
      'AC_raw',
      'AN_raw',
      'AF_raw',
      'nhomalt_raw',
      'AC_proband',
      'AN_proband',
      'AF_proband'
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
            { range: { ['AC_raw']: { gt: 0 } } },
          ],
        },
      },
      sort: [{ pos: { order: 'asc' } }],
    },
  })

  const ssc_genomeVariants = ssc_ghits.map(shapeGnomadVariantSummary({ type: 'gene', geneId }))
  const allVariants = mergeSSCVariants(sparkVariants, ssc_genomeVariants)

  const query = `{
    gene(gene_id: "${geneId}" reference_genome: GRCh38) {
      gene_id
      variants(dataset: gnomad_r3){
        pos
        variantId
        rsid
        exome{
          ac
          an
        }
        genome{
          ac
          an
          filters
        }
      }
    }
  }
  `

  const gnomad_data = await fetch("https://gnomad.broadinstitute.org/api", {
    body: JSON.stringify({
      query
    }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  }).then(response => response.json())

  const combinedVariants = mergeSfariAndGnomadVariantSummaries(allVariants, gnomad_data.data.gene.variants)
  const dnms = await fetchDenovos(ctx, geneId)

  annotateVariantsWithDenovoFlag(combinedVariants, dnms)

  const func_data = await fetchFunctionalData(ctx, geneId)
  annotateVariantsWithFuncFlag(combinedVariants, func_data)

  return combinedVariants
}

export default fetchVariantsByGene
