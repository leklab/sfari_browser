/* eslint-disable camelcase */
import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
} from 'graphql'

import {
  ClinvarVariantType,
  fetchClinvarVariantsInGene,
  fetchClinvarVariantsInTranscript,
} from '../datasets/clinvar'

import transcriptType, {
  CompositeTranscriptType,
  fetchCompositeTranscriptByGene,
  lookupTranscriptsByTranscriptId,
  lookupAllTranscriptsByGeneId,
} from './transcript'

import exonType, { lookupExonsByGeneId } from './exon'
import { MitoVariantSummaryType } from './mito_variant'
import fetchMitoVariantsByGene from '../datasets/fetchMitoVariantsByGene'

const mitoGeneType = new GraphQLObjectType({
  name: 'MitoGene',
  fields: () => ({
    _id: { type: GraphQLString },
    omim_description: { type: GraphQLString },
    gene_id: { type: GraphQLString },
    omim_accession: { type: GraphQLString },
    chrom: { type: GraphQLString },
    strand: { type: GraphQLString },
    full_gene_name: { type: GraphQLString },
    gene_name_upper: { type: GraphQLString },
    other_names: { type: new GraphQLList(GraphQLString) },
    canonical_transcript: { type: GraphQLString },
    start: { type: GraphQLInt },
    stop: { type: GraphQLInt },
    xstop: { type: GraphQLFloat },
    xstart: { type: GraphQLFloat },
    gene_name: { type: GraphQLString },
    composite_transcript: {
      type: CompositeTranscriptType,
      resolve: (obj, args, ctx) => fetchCompositeTranscriptByGene(ctx, obj),
    },
    
    clinvar_variants: {
      type: new GraphQLList(ClinvarVariantType),
      args: {
        transcriptId: { type: GraphQLString },
      },
      resolve: (obj, args, ctx) => {
        return args.transcriptId
          ? fetchClinvarVariantsInTranscript(args.transcriptId, ctx)
          : fetchClinvarVariantsInGene(obj.gene_id, ctx)
      },
    },
    transcript: {
      type: transcriptType,
      resolve: (obj, args, ctx) =>
        lookupTranscriptsByTranscriptId(ctx.database.gnomad, obj.canonical_transcript, obj.gene_name),
    },
    transcripts: {
      type: new GraphQLList(transcriptType),
      resolve: (obj, args, ctx) =>
        lookupAllTranscriptsByGeneId(ctx.database.gnomad, obj.gene_id),
    },
    exons: {
      type: new GraphQLList(exonType),
      resolve: (obj, args, ctx) => lookupExonsByGeneId(ctx.database.gnomad, obj.gene_id),
    },
    variants: {
      type: new GraphQLList(MitoVariantSummaryType),
      args: {
        transcriptId: { type: GraphQLString },
      },
      resolve: (obj, args, ctx) => {
        return fetchMitoVariantsByGene(ctx, obj.gene_id, obj.canonical_transcript)
      },
    },
  }),
})

export default mitoGeneType
