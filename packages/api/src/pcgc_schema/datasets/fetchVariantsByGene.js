import { fetchAllSearchResults } from '../../utilities/elasticsearch'
import { mergeOverlappingRegions } from '../../utilities/region'
import { lookupExonsByGeneId } from '../types/exon'
import { request } from "graphql-request"
/*
import {
  annotateVariantsWithMNVFlag,
  fetchGnomadMNVsByIntervals,
} from './gnomadMultiNucleotideVariants'
*/

import mergePcgcAndGnomadVariantSummaries from './mergePcgcAndGnomadVariants'
import mergeExomeAndGenomeVariantSummaries from './mergeExomeAndGenomeVariants'
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


const fetchDenovos = async (ctx, geneId) => {

  const hits = await fetchAllSearchResults(ctx.database.elastic, {

    index: 'autism_dnms',
    type: 'variant',
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

/*
  const requests = [
    { index: 'gnomad_exomes_2_1_1', subset },
    // All genome samples are non_cancer, so separate non-cancer numbers are not stored
    { index: 'gnomad_genomes_2_1_1', subset: subset === 'non_cancer' ? 'gnomad' : subset },
  ]
*/
  /*
  const [exomeVariants, genomeVariants] = await Promise.all(
    requests.map(async ({ index, subset }) => {
      const hits = await fetchAllSearchResults(ctx.database.elastic, {
        index,
        type: 'variant',
        size: 10000,
        _source: [
          //`${subset}.AC_adj`,
          //`${subset}.AN_adj`,
          //`${subset}.nhomalt_adj`,
          'alt',
          'chrom',
          'filters',
          'flags',
          //'nonpar',
          'pos',
          'ref',
          'rsid',
          'sortedTranscriptConsequences',
          'variant_id',
          'xpos',
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
                { range: { [`${subset}.AC_raw`]: { gt: 0 } } },
              ],
            },
          },
          sort: [{ pos: { order: 'asc' } }],
        },
      })

      return hits.map(shapeGnomadVariantSummary(subset, { type: 'gene', geneId }))

    })
  )*/

  //await Promise.all(
//    const hits = fetchAllSearchResults(ctx.database.elastic, {


  const hits = await fetchAllSearchResults(ctx.database.elastic, { 
//      index: 'pcgc_chr20_test',
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
        //'nonpar',
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
      /*
      body: {
        query : {
          nested: {
            path: 'sortedTranscriptConsequences',
            query:{
              match: {
                'sortedTranscriptConsequences.gene_id': geneId
              }
            }
          }
        },*/
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

  const exomeVariants = hits.map(shapeGnomadVariantSummary({ type: 'gene', geneId }))


  const ghits = await fetchAllSearchResults(ctx.database.elastic, { 
      index: 'sfari_genomes',
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
      /*
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
      },*/
      
      body: {
        query : {
          nested: {
            path: 'sortedTranscriptConsequences',
            query:{
              match: {
                'sortedTranscriptConsequences.gene_id': geneId
              }
            }
          }
        },
        sort: [{ pos: { order: 'asc' } }],
      },
    })

  console.log(ghits)
  const genomeVariants = ghits.map(shapeGnomadVariantSummary({ type: 'gene', geneId }))
  console.log(genomeVariants)
  const exomeAndGenomeVariants = mergeExomeAndGenomeVariantSummaries(exomeVariants, genomeVariants)

  // console.log(exomeAndGenomeVariants)


  //)
  //console.log("Checking local ES query")
  //console.log(exomeVariants)

  const query = `{
    gene(gene_id: "${geneId}" reference_genome: GRCh38) {
      gene_id
      gene_name
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
  //request("http://gnomad.broadinstitute.org/api", query).then(console.log).catch(console.error)
  //console.log("In here 33")
  //const gnomad_data = request("http://gnomad.broadinstitute.org/api", query).then(console.log).catch(console.error)

  const gnomad_data = await request("https://gnomad.broadinstitute.org/api", query)
  //console.log(gnomad_data.gene.variants)

  //const combinedVariants = mergePcgcAndGnomadVariantSummaries(exomeVariants,gnomad_data.gene.variants)
  const combinedVariants = mergePcgcAndGnomadVariantSummaries(exomeAndGenomeVariants,gnomad_data.gene.variants)


  const dnms = await fetchDenovos(ctx,geneId)
  //console.log(dnms)
  annotateVariantsWithDenovoFlag(combinedVariants,dnms)

  //console.log(combinedVariants)
  //const combinedVariants = mergeExomeAndGenomeVariantSummaries(exomeVariants, genomeVariants)

  // TODO: This can be fetched in parallel with exome/genome data
  //const mnvs = await fetchGnomadMNVsByIntervals(ctx, mergedRegions)
  //annotateVariantsWithMNVFlag(combinedVariants, mnvs)
  //console.log("In here")
  //console.log(exomeVariants)
  //console.log("In here2")
  
  //console.log(combinedVariants.length)
  //console.log(exomeVariants.length)

  return combinedVariants
  
  //return exomeVariants
  //const variantData = exomeVariants._source

/*
  return {
    // Variant ID fields
    alt: variantData.alt,
    chrom: variantData.chrom,
    pos: variantData.pos,
    ref: variantData.ref,
    variantId: variantData.variant_id,
    xpos: variantData.xpos
  }*/

}

export default fetchVariantsByGene
