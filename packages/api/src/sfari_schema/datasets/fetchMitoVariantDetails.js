import 'whatwg-fetch'

const POPULATIONS = ['afr', 'amr', 'eas', 'eur', 'oth', 'sas']

const formatPopulations = variantData =>
  POPULATIONS.map(popId => ({
    id: popId.toUpperCase(),
    ac: variantData.AC_adj[popId] || 0,
    an: variantData.AN_adj[popId] || 0,
    ac_hom: variantData.nhomalt_adj[popId] || 0,

  }))

const fetchVariantData = async (ctx, variantId) => {
  const genomeData = await ctx.database.elastic.search({
    index: 'spark_mito',
    _source: [
      'alt',
      'chrom',
      'filters',
      'pos',
      'ref',
      'sortedTranscriptConsequences',
      'haplogroups',
      'populations',
      'variant_id',
      'xpos',
      'ac',
      'af',
      'an',
      'ac_het',
      'ac_hom',
      'max_heteroplasmy'
    ],
    body: {
      query: {
        bool: {
          filter: [
            { term: { variant_id: variantId } },
          ],
        },
      },
    },
    size: 1,
  })

  return { genomeData: genomeData.hits.hits[0] ? genomeData.hits.hits[0]._source : undefined }

}


const fetchColocatedVariants = async (ctx, variantId) => {
  const parts = variantId.split('-')
  const chrom = parts[0]
  const pos = Number(parts[1])


  const exomeResponse = await ctx.database.elastic.search({
    index: 'pcgc_exomes',
    type: 'variant',
    _source: ['variant_id'],
    body: {
      query: {
        bool: {
          filter: [
            { term: { chrom } },
            { term: { pos } },
            { range: { ['AC_raw']: { gt: 0 } } },
          ],
        },
      },
    },
  })

  const genomeResponse = await ctx.database.elastic.search({
    index: 'spark_genomes',
    type: 'variant',
    _source: ['variant_id'],
    body: {
      query: {
        bool: {
          filter: [
            { term: { chrom } },
            { term: { pos } },
          ],
        },
      },
    },
  })

  // eslint-disable no-underscore-dangle
  const exomeVariants = exomeResponse.hits.hits.map(doc => doc._source.variant_id)
  const genomeVariants = genomeResponse.hits.hits.map(doc => doc._source.variant_id)
  // eslint-enable no-underscore-dangle 
  const combinedVariants = exomeVariants.concat(genomeVariants)

  return combinedVariants
    .filter(otherVariantId => otherVariantId !== variantId)
    .sort()
    .filter(
      (otherVariantId, index, allOtherVariantIds) =>
        otherVariantId !== allOtherVariantIds[index + 1]
    )
}

const fetchRSID = async (ctx, variantId) => {
  const query = `{
    variant(variantId: "${variantId}", dataset: gnomad_r3){
      rsid
      variantId    
    }
  }
  `
  try {
    const gnomad_data = await fetch("https://gnomad.broadinstitute.org/api", {
      body: JSON.stringify({
        query
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(response => response.json())

    return gnomad_data.json()
  } catch (error) {
    return undefined
  }

}
const fetchGnomadPopFreq = async (ctx, variantId) => {
  const query = `{
    variant(variantId: "${variantId}", dataset: gnomad_r3){
      ... on VariantDetails{
        genome{
          ac
          an
          faf95 {
            popmax
            popmax_population
          }

          populations{
            id
            ac
            an
            ac_hemi
            ac_hom
          }
        }
      }
    }
  }
  `
  try {
    const gnomad_data = await fetch("https://gnomad.broadinstitute.org/api", {
      body: JSON.stringify({
        query
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(response => response.json())


    return gnomad_data.variant.genome
  } catch (error) {
    return undefined
  }

}

const fetchMitoVariantDetails = async (ctx, variantId) => {
  const { genomeData } = await fetchVariantData(ctx, variantId)
  const sharedData = genomeData

  const sharedVariantFields = {
    alt: sharedData.alt,
    chrom: sharedData.chrom,
    pos: sharedData.pos,
    ref: sharedData.ref,
    variantId: sharedData.variant_id,
    xpos: sharedData.xpos,
  }

  return {
    gqlType: 'MitoVariantDetails',
    ...sharedVariantFields,
    spark_genome: genomeData
      ? {
        ...sharedVariantFields,

        ac: genomeData.ac,
        an: genomeData.an,
        ac_hom: genomeData.ac_hom,
        ac_het: genomeData.ac_het,
        max_heteroplasmy: genomeData.max_heteroplasmy
      }
      : null,

    sortedTranscriptConsequences: sharedData.sortedTranscriptConsequences || [],
    haplogroups: sharedData.haplogroups || [],
    populations: sharedData.populations || [],
  }
}

export default fetchMitoVariantDetails
