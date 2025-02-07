import 'whatwg-fetch'

const formatHistogram = histogramData => ({
  bin_edges: histogramData.bin_edges.split('|').map(s => Number(s)),
  bin_freq: histogramData.bin_freq.split('|').map(s => Number(s)),
  n_larger: histogramData.n_larger,
  n_smaller: histogramData.n_smaller,
})

const POPULATIONS = ['afr', 'amr', 'eas', 'eur', 'oth', 'sas']

const formatPopulations = variantData =>
  POPULATIONS.map(popId => ({
    id: popId.toUpperCase(),
    ac: variantData.AC_adj[popId] || 0,
    an: variantData.AN_adj[popId] || 0,
    ac_hom: variantData.nhomalt_adj[popId] || 0,
  }))

const fetchVariantData = async (ctx, variantId) => {
  const exomeData = await ctx.database.elastic.search({
    index: 'spark_exomes_test',
    _source: [
      'alt',
      'chrom',
      'filters',
      'pos',
      'ref',
      'sortedTranscriptConsequences',
      'variant_id',
      'xpos',
      'AC_adj',
      'AN_adj',
      'AF_adj',
      'nhomalt_adj',
      'AC',
      'AF',
      'AN',
      'nhomalt',
      'AC_raw',
      'AN_raw',
      'AF_raw',
      'AC_male',
      'AN_male',
      'nhomalt_male',
      'AC_female',
      'AN_female',
      'nhomalt_female',
      'genotype_quality',
      'genotype_depth',
      'allele_balance',
      'in_silico_predictors'
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

  const genomeData = await ctx.database.elastic.search({
    index: 'spark_genomes',
    _source: [
      'alt',
      'chrom',
      'filters',
      'pos',
      'ref',
      'sortedTranscriptConsequences',
      'variant_id',
      'xpos',
      'AC_adj',
      'AN_adj',
      'AF_adj',
      'nhomalt_adj',
      'AC',
      'AF',
      'AN',
      'nhomalt',
      'AC_raw',
      'AN_raw',
      'AF_raw',
      'AC_male',
      'AN_male',
      'nhomalt_male',
      'AC_female',
      'AN_female',
      'nhomalt_female',
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

  const sscGenomeData = await ctx.database.elastic.search({
    index: 'ssc_genomes',
    _source: [
      'alt',
      'chrom',
      'filters',
      'pos',
      'ref',
      'sortedTranscriptConsequences',
      'variant_id',
      'xpos',
      'AC_adj',
      'AN_adj',
      'AF_adj',
      'nhomalt_adj',
      'AC',
      'AF',
      'AN',
      'nhomalt',
      'AC_raw',
      'AN_raw',
      'AF_raw',
      'AC_male',
      'AN_male',
      'nhomalt_male',
      'AC_female',
      'AN_female',
      'nhomalt_female',
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

  return {
    exomeData: exomeData.hits.hits[0] ? exomeData.hits.hits[0]._source : undefined,
    genomeData: genomeData.hits.hits[0] ? genomeData.hits.hits[0]._source : undefined,
    sscGenomeData: sscGenomeData.hits.hits[0] ? sscGenomeData.hits.hits[0]._source : undefined
  }
}


const fetchColocatedVariants = async (ctx, variantId) => {
  const parts = variantId.split('-')
  const chrom = parts[0]
  const pos = Number(parts[1])


  const exomeResponse = await ctx.database.elastic.search({
    index: 'spark_exomes_test',
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


    return gnomad_data
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
          filters
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

    return gnomad_data.data.variant.genome
  } catch (error) {
    return undefined
  }

}

const fetchVariantDetails = async (ctx, variantId) => {
  const { exomeData, genomeData, sscGenomeData } = await fetchVariantData(ctx, variantId)

  const clinVarES = await ctx.database.elastic.search({
    index: 'clinvar_grch38',
    _source: [
      'allele_id',
      'alt',
      'chrom',
      'clinical_significance',
      'gene_id_to_consequence_json',
      'gold_stars',
      'pos',
      'ref',
      'variant_id',
      'xpos',
    ],
    body: {
      query: {
        bool: {
          filter: [
            { term: { variant_id: variantId } },
          ],
        },
      }
    },
    size: 1,
  })

  const clinVarData = clinVarES.hits.hits[0] ? clinVarES.hits.hits[0]._source : undefined

  const denovoES = await ctx.database.elastic.search({
    index: 'autism_dnms',
    _source: [
      'variant_id',
      'high_confidence_dnm',
    ],
    body: {
      query: {
        bool: {
          filter: [
            { term: { variant_id: variantId } },
          ],
        },
      }
    },
    size: 1,
  })

  const denovoData = denovoES.hits.hits[0] ? denovoES.hits.hits[0]._source : undefined

  const dis_asd = await ctx.database.elastic.search({
    index: 'dis_asd',
    _source: [
      'DNA_Disease_impact_score',
      'RNA_Disease_impact_score'
    ],
    body: {
      query: {
        bool: {
          filter: [
            { term: { variant_id: variantId } },
          ],
        },
      }
    },
    size: 1,
  })

  const dis_asdData = dis_asd.hits.hits[0] ? dis_asd.hits.hits[0]._source : undefined

  const mavedb_func = await ctx.database.elastic.search({
    index: 'mavedb',
    _source: [
      'score',
      'sigma',
      'max',
      'min',
      'accession'
    ],
    body: {
      query: {
        bool: {
          filter: [
            { term: { variant: variantId } },
          ],
        },
      },
    },
  })

  const mavedbData = mavedb_func.hits.hits[0] ? mavedb_func.hits.hits[0]._source : undefined
  const gnomad_data = await fetchRSID(ctx, variantId)
  const gnomad_pop_data = await fetchGnomadPopFreq(ctx, variantId)
  const sharedData = exomeData || genomeData || sscGenomeData

  const sharedVariantFields = {
    alt: sharedData.alt,
    chrom: sharedData.chrom,
    pos: sharedData.pos,
    ref: sharedData.ref,
    variantId: sharedData.variant_id,
    xpos: sharedData.xpos,
  }

  const colocatedVariants = await fetchColocatedVariants(ctx, variantId)

  return {
    gqlType: 'VariantDetails',
    ...sharedVariantFields,
    filters: gnomad_pop_data ? gnomad_pop_data.filters : null,
    colocatedVariants,
    gnomadPopFreq: gnomad_pop_data ? gnomad_pop_data.populations : null,
    gnomadAF: gnomad_pop_data ? gnomad_pop_data.ac / gnomad_pop_data.an : null,
    spark_exome: exomeData
      ? {
        // Include variant fields so that the reads data resolver can access them.
        ...sharedVariantFields,
        ac: exomeData.AC,
        an: exomeData.AN,
        ac_hom: exomeData.nhomalt,

        ac_male: exomeData.AC_male,
        an_male: exomeData.AN_male,
        ac_male_hom: exomeData.nhomalt_male,

        ac_female: exomeData.AC_female,
        an_female: exomeData.AN_female,
        ac_female_hom: exomeData.nhomalt_female,

        populations: formatPopulations(exomeData),

        qualityMetrics: {
          alleleBalance: {
            alt: exomeData.allele_balance.alt_adj,
          },
          genotypeDepth: {
            all: exomeData.genotype_depth.all_adj,
            alt: exomeData.genotype_depth.alt_adj,
          },
          genotypeQuality: {
            all: exomeData.genotype_quality.all_adj,
            alt: exomeData.genotype_quality.alt_adj,
          },
        },
      }
      : null,
    spark_genome: genomeData
      ? {
        ...sharedVariantFields,
        ac: genomeData.AC,
        an: genomeData.AN,
        ac_hom: genomeData.nhomalt,
        ac_male: genomeData.AC_male,
        an_male: genomeData.AN_male,
        ac_male_hom: genomeData.nhomalt_male,

        ac_female: genomeData.AC_female,
        an_female: genomeData.AN_female,
        ac_female_hom: genomeData.nhomalt_female,

        populations: formatPopulations(genomeData),
      }
      : null,

    ssc_genome: sscGenomeData
      ? {
        ...sharedVariantFields,

        ac: sscGenomeData.AC,
        an: sscGenomeData.AN,
        ac_hom: sscGenomeData.nhomalt,

        ac_male: sscGenomeData.AC_male,
        an_male: sscGenomeData.AN_male,
        ac_male_hom: sscGenomeData.nhomalt_male,

        ac_female: sscGenomeData.AC_female,
        an_female: sscGenomeData.AN_female,
        ac_female_hom: sscGenomeData.nhomalt_female,

        populations: formatPopulations(sscGenomeData),
      }
      : null,

    gnomad_faf95_popmax: gnomad_pop_data ? gnomad_pop_data.faf95.popmax : null,
    gnomad_faf95_population: gnomad_pop_data ? gnomad_pop_data.faf95.popmax_population : null,

    rsid: gnomad_data.data.variant ? gnomad_data.data.variant.rsid : null,
    clinvarAlleleID: clinVarData ? clinVarData.allele_id : null,
    denovoHC: denovoData ? denovoData.high_confidence_dnm : null,
    dis_asd: dis_asdData ? dis_asdData : null,
    func_annotation: mavedbData ? mavedbData : null,
    sortedTranscriptConsequences: sharedData.sortedTranscriptConsequences || [],
    in_silico_predictors: exomeData ? exomeData.in_silico_predictors : null
  }
}

export default fetchVariantDetails
