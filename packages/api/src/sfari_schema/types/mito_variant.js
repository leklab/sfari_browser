import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'

export const MitoVariantInterface = new GraphQLInterfaceType({
  name: 'MitoVariant',
  fields: {
    alt: { type: new GraphQLNonNull(GraphQLString) },
    chrom: { type: new GraphQLNonNull(GraphQLString) },
    pos: { type: new GraphQLNonNull(GraphQLInt) },
    ref: { type: new GraphQLNonNull(GraphQLString) },
    variantId: { type: new GraphQLNonNull(GraphQLString) },
    xpos: { type: new GraphQLNonNull(GraphQLFloat) },
  },
})

const MitoVariantSequencingDataType = new GraphQLObjectType({
  name: 'MitoVariantSequencingData',
  fields: {
    ac: { type: GraphQLInt },
    ac_het: { type: GraphQLInt },
    ac_hom: { type: GraphQLInt },
    an: { type: GraphQLInt },
    af: { type: GraphQLFloat },
    max_heteroplasmy : { type: GraphQLFloat },
        
    filters: { type: new GraphQLList(GraphQLString) },
  },
})


export const MitoVariantSummaryType = new GraphQLObjectType({
  name: 'MitoVariantSummary',
  fields: {
    // Variant ID fields
    alt: { type: new GraphQLNonNull(GraphQLString) },
    chrom: { type: new GraphQLNonNull(GraphQLString) },
    pos: { type: new GraphQLNonNull(GraphQLInt) },
    ref: { type: new GraphQLNonNull(GraphQLString) },
    variantId: { type: new GraphQLNonNull(GraphQLString) },
    xpos: { type: new GraphQLNonNull(GraphQLFloat) },
    // Other fields
    consequence: { type: GraphQLString },
    consequence_in_canonical_transcript: { type: GraphQLBoolean },
    flags: { type: new GraphQLList(GraphQLString) },
    hgvs: { type: GraphQLString },
    hgvsc: { type: GraphQLString },
    hgvsp: { type: GraphQLString },

    spark_genome: { type: MitoVariantSequencingDataType },
    ssc_genome: { type: MitoVariantSequencingDataType },
  },
})
