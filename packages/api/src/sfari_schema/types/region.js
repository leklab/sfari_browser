import { GraphQLList, GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql'
import { UserVisibleError } from '../errors'
import geneType, { fetchGenesByInterval } from './gene'
import { VariantSummaryType } from './variant'
import countVariantsInRegion from '../datasets/countVariantsInRegion'
import fetchVariantsByRegion from '../datasets/fetchVariantsByRegion'

import { StructuralVariantSummaryType } from './structuralVariant'
import fetchGnomadStructuralVariantsByRegion from '../datasets/fetchGnomadStructuralVariantsByRegion'


// Individual variants will only be returned if a region has fewer than this many variants
const FETCH_INDIVIDUAL_VARIANTS_LIMIT = 30000

const regionType = new GraphQLObjectType({
  name: 'Region',
  fields: () => ({
    start: { type: GraphQLInt },
    stop: { type: GraphQLInt },
    xstart: { type: GraphQLInt },
    xstop: { type: GraphQLInt },
    chrom: { type: GraphQLString },
    regionSize: { type: GraphQLInt },

    genes: {
      type: new GraphQLList(geneType),
      resolve: (obj, args, ctx) =>
        fetchGenesByInterval(ctx, {
          xstart: obj.xstart,
          xstop: obj.xstop,
        }),
    },

    structural_variants: {
      type: new GraphQLList(StructuralVariantSummaryType),
      resolve: async (obj, args, ctx) => fetchGnomadStructuralVariantsByRegion(ctx, obj),
    },

    variants: {
      type: new GraphQLList(VariantSummaryType),
      resolve: async (obj, args, ctx) => {
        const numVariantsInRegion = await countVariantsInRegion(ctx, obj)

        if (numVariantsInRegion > FETCH_INDIVIDUAL_VARIANTS_LIMIT) {
          throw UserVisibleError(
            `Individual variants can only be returned for regions with fewer than ${FETCH_INDIVIDUAL_VARIANTS_LIMIT} variants`
          )
        }
        return fetchVariantsByRegion(ctx, obj)
      },
    },

  }),
})

export default regionType
