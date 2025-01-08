import { fetchAllSearchResults } from '../../utilities/elasticsearch'
// import { getXpos } from '../../utilities/variant'
import shapeGnomadVariantSummary from './shapeGnomadVariantSummary'
import mergeExomeAndGenomeVariantSummaries from './mergeExomeAndGenomeVariants'
// import mergePcgcAndGnomadVariantSummaries from './mergePcgcAndGnomadVariants'

const fetchVariantsByRegion = async (ctx, { chrom, start, stop }, subset) => {
  const hits = await fetchAllSearchResults(ctx.database.elastic, {
    index: 'pcgc_exomes',
    type: 'variant',
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
            { term: { chrom } },
            {
              range: {
                pos: {
                  gte: start,
                  lte: stop,
                },
              },
            },
            { range: { ['AC_raw']: { gt: 0 } } },
          ],
        },
      },
      sort: [{ pos: { order: 'asc' } }],
    },
  })

  const exomeVariants = hits.map(shapeGnomadVariantSummary({ type: 'region' }))

  const ghits = await fetchAllSearchResults(ctx.database.elastic, {
    index: 'ssc_genomes',
    type: 'variant',
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
            { term: { chrom } },
            {
              range: {
                pos: {
                  gte: start,
                  lte: stop,
                },
              },
            },
          ],
        },
      },
      sort: [{ pos: { order: 'asc' } }],
    },
  })

  const genomeVariants = ghits.map(shapeGnomadVariantSummary({ type: 'region' }))
  const exomeAndGenomeVariants = mergeExomeAndGenomeVariantSummaries(exomeVariants, genomeVariants)

  const query = `{
    region(start: ${start}, stop: ${stop}, chrom: "${chrom}", reference_genome: GRCh38) {
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
        }
      }
    }
  }
  `
  return exomeAndGenomeVariants
}

export default fetchVariantsByRegion
