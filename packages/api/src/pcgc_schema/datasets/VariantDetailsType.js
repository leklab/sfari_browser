import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'

import { VariantInterface } from '../types/variant'
import { TranscriptConsequenceType } from './transcriptConsequence'

const HistogramType = new GraphQLObjectType({
  name: 'Histogram',
  fields: {
    bin_edges: { type: new GraphQLList(GraphQLFloat) },
    bin_freq: { type: new GraphQLList(GraphQLFloat) },
    n_larger: { type: GraphQLInt },
    n_smaller: { type: GraphQLInt },
  },
})

const PopulationType = new GraphQLObjectType({
  name: 'VariantPopulation',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    ac: { type: new GraphQLNonNull(GraphQLInt) },
    an: { type: new GraphQLNonNull(GraphQLInt) },
    ac_hemi: { type: new GraphQLNonNull(GraphQLInt) },
    ac_hom: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

const InSilicoPredictorsType = new GraphQLObjectType({
  name: 'InSilicoPredictors',
  fields: {
    cadd: { type: GraphQLFloat },
    splice_ai: { type: GraphQLFloat },
    revel: { type: GraphQLString },
    primate_ai: { type: GraphQLFloat },
  }
})

const dis_asdType = new GraphQLObjectType({
  name: 'dis_asd',
  fields: {
    DNA_Disease_impact_score: { type: GraphQLFloat },
    RNA_Disease_impact_score: { type: GraphQLString },
  }
})

const func_annoType = new GraphQLObjectType({
  name: 'func_annotation',
  fields: {
    score: { type: GraphQLFloat },
  }
})

const GnomadVariantQualityMetricsType = new GraphQLObjectType({
  name: 'GnomadVariantQualityMetrics',
  fields: {

    alleleBalance: {
      type: new GraphQLObjectType({
        name: 'GnomadVariantAlleleBalance',
        fields: {
          alt: { type: HistogramType },
        },
      }),
    },
    genotypeDepth: {
      type: new GraphQLObjectType({
        name: 'GnomadVariantGenotypeDepth',
        fields: {
          all: { type: HistogramType },
          alt: { type: HistogramType },
        },
      }),
    },
    genotypeQuality: {
      type: new GraphQLObjectType({
        name: 'GnomadVariantGenotypeQuality',
        fields: {
          all: { type: HistogramType },
          alt: { type: HistogramType },
        },
      }),
    },
  },
})

const VariantDetailsType = new GraphQLObjectType({
  name: 'VariantDetails',
  interfaces: [VariantInterface],
  fields: {
    // variant interface fields
    alt: { type: new GraphQLNonNull(GraphQLString) },
    chrom: { type: new GraphQLNonNull(GraphQLString) },
    pos: { type: new GraphQLNonNull(GraphQLInt) },
    ref: { type: new GraphQLNonNull(GraphQLString) },
    variantId: { type: new GraphQLNonNull(GraphQLString) },
    xpos: { type: new GraphQLNonNull(GraphQLFloat) },
    filters: { type: new GraphQLList(GraphQLString) },
    colocatedVariants: { type: new GraphQLList(GraphQLString) },
    gnomadPopFreq: { type: new GraphQLList(PopulationType) },
    gnomadAF: { type: GraphQLFloat },

    spark_exome: {
      type: new GraphQLObjectType({
        name: 'VariantDetailsExomeData',
        fields: {
          ac: { type: GraphQLInt },
          an: { type: GraphQLInt },
          ac_hom: { type: GraphQLInt },

          ac_male: { type: GraphQLInt },
          an_male: { type: GraphQLInt },
          ac_male_hom: { type: GraphQLInt },

          ac_female: { type: GraphQLInt },
          an_female: { type: GraphQLInt },
          ac_female_hom: { type: GraphQLInt },

          populations: { type: new GraphQLList(PopulationType) },
          qualityMetrics: { type: GnomadVariantQualityMetricsType },
        },
      }),
    },

    spark_genome: {
      type: new GraphQLObjectType({
        name: 'GnomadVariantDetailsGenomeData',
        fields: {
          ac: { type: GraphQLInt },
          an: { type: GraphQLInt },
          ac_hom: { type: GraphQLInt },

          ac_male: { type: GraphQLInt },
          an_male: { type: GraphQLInt },
          ac_male_hom: { type: GraphQLInt },

          ac_female: { type: GraphQLInt },
          an_female: { type: GraphQLInt },
          ac_female_hom: { type: GraphQLInt },

          populations: { type: new GraphQLList(PopulationType) },
        },
      }),
    },

    ssc_genome: {
      type: new GraphQLObjectType({
        name: 'GnomadVariantDetailsGenomeDataX',
        fields: {
          ac: { type: GraphQLInt },
          an: { type: GraphQLInt },
          ac_hom: { type: GraphQLInt },
          ac_male: { type: GraphQLInt },
          an_male: { type: GraphQLInt },
          ac_male_hom: { type: GraphQLInt },

          ac_female: { type: GraphQLInt },
          an_female: { type: GraphQLInt },
          ac_female_hom: { type: GraphQLInt },

          populations: { type: new GraphQLList(PopulationType) },

        },
      }),
    },

    gnomad_faf95_popmax: { type: GraphQLFloat },
    gnomad_faf95_population: { type: GraphQLString },
    rsid: { type: GraphQLString },
    clinvarAlleleID: { type: GraphQLString },
    denovoHC: { type: GraphQLString },
    dis_asd: { type: dis_asdType },
    func_annotation: { type: func_annoType },
    sortedTranscriptConsequences: { type: new GraphQLList(TranscriptConsequenceType) },
    in_silico_predictors: { type: InSilicoPredictorsType }
  },
  isTypeOf: variantData => variantData.gqlType === 'VariantDetails',
})

export default VariantDetailsType
