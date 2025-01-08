const {
  GraphQLEnumType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} = require('graphql')

const { UserVisibleError } = require('./errors')
const logger = require('./logging')
const resolveReads = require('./resolveReads')

const ReadType = new GraphQLObjectType({
  name: 'Read',
  fields: {
    bamPath: { type: new GraphQLNonNull(GraphQLString) },
    category: { type: new GraphQLNonNull(GraphQLString) },
    indexPath: { type: new GraphQLNonNull(GraphQLString) },
    readGroup: { type: new GraphQLNonNull(GraphQLString) },
  },
})

const VariantReadsType = new GraphQLObjectType({
  name: 'VariantReads',
  fields: {

    exome: {
      type: new GraphQLList(ReadType),
      resolve: async obj => {
        const config = {
          readsDirectory: '/readviz/spark_exome',
          publicPath: '/readviz/spark_exome',
          meta: 's42811_gs50_gn857',
        }

        if (!config) {
          return null
        }

        try {
          return await resolveReads(config, obj)
        } catch (err) {
          logger.warn(err)
          throw new UserVisibleError(`Unable to load exome reads for ${variantId}`)
        }

        //return null
      },
    },
    spark_genome: {
      type: new GraphQLList(ReadType),
      resolve: async obj => {
        const { variantId } = obj
        const config = {
          readsDirectory: '/readviz/spark_wgs',
          publicPath: '/readviz/spark_wgs',
          meta: 's42811_gs50_gn857',
        }

        if (!config) {
          return null
        }

        try {
          //return await resolve(config, obj)
          return await resolveReads(config, obj)
        } catch (err) {
          logger.warn(err)
          throw new UserVisibleError(`Unable to load genome reads for ${variantId}`)
        }
      },
    },

    ssc_genome: {
      type: new GraphQLList(ReadType),
      resolve: async obj => {
        const { variantId } = obj
        const config = {
          readsDirectory: '/readviz/ssc_wgs',
          publicPath: '/readviz/ssc_wgs',
          meta: 's42811_gs50_gn857',
        }

        if (!config) {
          return null
        }

        try {
          return await resolveReads(config, obj)
        } catch (err) {
          logger.warn(err)
          throw new UserVisibleError(`Unable to load genome reads for ${variantId}`)
        }
      },
    },

  },
})

const VARIANT_ID_REGEX = /^(\d+|X|Y|M)-([1-9][0-9]*)-([ACGT]+)-([ACGT]+)$/

const isVariantId = str => {
  const match = VARIANT_ID_REGEX.exec(str)
  if (!match) {
    return false
  }

  const chrom = match[1]
  const chromNumber = Number(chrom)
  if (!Number.isNaN(chromNumber) && (chromNumber < 1 || chromNumber > 22)) {
    return false
  }

  const position = Number(match[2])
  if (position > 1e9) {
    return false
  }

  return true
}

const RootType = new GraphQLObjectType({
  name: 'Root',
  fields: {
    variantReads: {
      type: VariantReadsType,
      args: {
        variantId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (obj, args) => {
        const { variantId } = args

        if (!isVariantId(variantId)) {
          throw new UserVisibleError(`Invalid variant ID: "${variantId}"`)
        }

        const [chrom, pos, ref, alt] = variantId.split('-')
        return {
          //dataset,
          variantId,
          chrom,
          pos: Number(pos),
          ref,
          alt,
        }
      },
    },
  },
})

const Schema = new GraphQLSchema({
  query: RootType,
})

module.exports = Schema
