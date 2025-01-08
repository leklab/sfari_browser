import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'

import { MitoVariantInterface } from '../types/mito_variant'
import { TranscriptConsequenceType } from './transcriptConsequence'
import { HaplogroupType } from './haplogroups'
import { PopulationType } from './haplogroups'

const MitoVariantDetailsType = new GraphQLObjectType({
  name: 'MitoVariantDetails',
  interfaces: [MitoVariantInterface],
  fields: {
    // variant interface fields
    alt: { type: new GraphQLNonNull(GraphQLString) },
    chrom: { type: new GraphQLNonNull(GraphQLString) },
    pos: { type: new GraphQLNonNull(GraphQLInt) },
    ref: { type: new GraphQLNonNull(GraphQLString) },
    variantId: { type: new GraphQLNonNull(GraphQLString) },
    xpos: { type: new GraphQLNonNull(GraphQLFloat) },

    spark_genome: {
      type: new GraphQLObjectType({
        name: 'MitoVariantDetailsGenomeData',
        fields: {
          ac: { type: GraphQLInt },
          an: { type: GraphQLInt },
          ac_het: { type: GraphQLInt },
          ac_hom: { type: GraphQLInt },
          max_heteroplasmy: { type: GraphQLFloat }
        },
      }),
    },
    ssc_genome: {
      type: new GraphQLObjectType({
        name: 'MitoVariantDetailsGenomeDataX',
        fields: {
          ac: { type: GraphQLInt },
          an: { type: GraphQLInt },
          ac_het: { type: GraphQLInt },
          ac_hom: { type: GraphQLInt },
          max_heteroplasmy: { type: GraphQLFloat }
        },
      }),
    },
    sortedTranscriptConsequences: { type: new GraphQLList(TranscriptConsequenceType) },
    haplogroups: { type: new GraphQLList(HaplogroupType) },
    populations: { type: new GraphQLList(PopulationType) },

  },
  isTypeOf: variantData => variantData.gqlType === 'MitoVariantDetails',
})

export default MitoVariantDetailsType
