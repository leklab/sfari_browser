import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql'

import { getXpos } from '../utilities/variant'

import fetchGnomadStructuralVariantDetails from './datasets/fetchGnomadStructuralVariantDetails'
import GnomadStructuralVariantDetailsType from './datasets/GnomadStructuralVariantDetailsType'

import geneType, {
  lookupGeneByGeneId,
  lookupGeneByName,
} from './types/gene'

import transcriptType, {
  lookupTranscriptsByTranscriptId,
} from './types/transcript'

import mitoGeneType from './types/mito_gene'
import regionType from './types/region'

import { SearchResultType, resolveSearchResults } from './types/search'
import { VariantInterface } from './types/variant'
import { MitoVariantInterface } from './types/mito_variant'

import fetchVariantDetails from './datasets/fetchVariantDetails'
import fetchMitoVariantDetails from './datasets/fetchMitoVariantDetails'

import VariantDetailsType from './datasets/VariantDetailsType'
import MitoVariantDetailsType from './datasets/MitoVariantDetailsType'


const rootType = new GraphQLObjectType({
  name: 'Root',
  description: `
The fields below allow for different ways to look up SFARI data. Click on the the Gene, Variant, or Region types to see more information.
  `,
  fields: () => ({
    gene: {
      description: 'Look up variant data by gene name. Example: ACTA1.',
      type: geneType,
      args: {
        gene_name: { type: GraphQLString },
        gene_id: { type: GraphQLString },
        filter: { type: GraphQLString },
      },
      resolve: (obj, args, ctx) => {
        if (args.gene_name) {
          return lookupGeneByName(ctx.database.gnomad, args.gene_name)
        }
        if (args.gene_id) {
          return lookupGeneByGeneId(ctx.database.gnomad, args.gene_id)
        }
        return 'No lookup found'
      },
    },

    mito_gene: {
      description: 'Look up variant data by mitochondrial gene name. Example: MT-CO1.',
      type: mitoGeneType,
      args: {
        gene_name: { type: GraphQLString },
        gene_id: { type: GraphQLString },
        filter: { type: GraphQLString },
      },
      resolve: (obj, args, ctx) => {
        if (args.gene_name) {
          return lookupGeneByName(ctx.database.gnomad, args.gene_name)
        }
        if (args.gene_id) {
          return lookupGeneByGeneId(ctx.database.gnomad, args.gene_id)
        }
        return 'No lookup found'
      },
    },


    transcript: {
      description: 'Look up variant data by transcript ID. Example: ENST00000407236.',
      type: transcriptType,
      args: {
        transcript_id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (obj, args, ctx) => {
        return lookupTranscriptsByTranscriptId(ctx.database.gnomad, args.transcript_id)
      },
    },

    region: {
      description: 'Look up data by start/stop. Example: (start: 55505222, stop: 55505300, chrom: 1).',
      type: regionType,
      args: {
        start: { type: new GraphQLNonNull(GraphQLInt) },
        stop: { type: new GraphQLNonNull(GraphQLInt) },
        chrom: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (obj, args) => ({
        start: args.start,
        stop: args.stop,
        chrom: args.chrom,
        xstart: getXpos(args.chrom, args.start),
        xstop: getXpos(args.chrom, args.stop),
        regionSize: args.stop - args.start,
      }),
    },

    searchResults: {
      type: new GraphQLList(SearchResultType),
      args: {
        query: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (obj, args, ctx) => resolveSearchResults(ctx, args.query),
    },


    structural_variant: {
      type: GnomadStructuralVariantDetailsType,
      args: {
        variantId: { type: GraphQLString },
      },
      resolve: (obj, args, ctx) => fetchGnomadStructuralVariantDetails(ctx, args.variantId),
    },


    variant: {
      description: 'Look up a single variant or rsid. Example: 1-55516888-G-GA.',
      type: VariantInterface,
      args: {
        variantId: { type: GraphQLString },
      },
      resolve: (obj, args, ctx) => {
        return fetchVariantDetails(ctx, args.variantId)
      },
    },

    mito_variant: {
      description: 'Look up a single variant or rsid. Example: 1-55516888-G-GA.',
      type: MitoVariantInterface,
      args: {
        variantId: { type: GraphQLString },
      },
      resolve: (obj, args, ctx) => {
        return fetchMitoVariantDetails(ctx, args.variantId)
      },
    },
  }),
})

const Schema = new GraphQLSchema({
  query: rootType,
  types: [VariantDetailsType, MitoVariantDetailsType],
})

export default Schema
