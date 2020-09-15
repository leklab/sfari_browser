export default `
query PcgcVariant($variantId: String!) {
  variant(variantId: $variantId) {
    alt
    chrom
    pos
    ref
    variantId 
    xpos
    ... on VariantDetails {
      rsid
      clinvarAlleleID
      denovoHC
      colocatedVariants
      gnomadAF
      gnomad_faf95_population
      gnomad_faf95_popmax
      exome {
        ac
        an
        ac_hom
        populations {
          id
          ac
          an
          ac_hom
        }
      }
     genome {
        ac
        an
        ac_hom
        populations {
          id
          ac
          an
          ac_hom
        }
      }
      gnomadPopFreq {
        id
        ac
        an
        ac_hom
      }      
      sortedTranscriptConsequences {
        canonical
        gene_id
        gene_symbol
        hgvs
        hgvsc
        hgvsp
        lof
        lof_flags
        lof_filter
        lof_info
        major_consequence
        polyphen_prediction
        sift_prediction
        transcript_id
      }
    }
  }
}
`

/*
export default `
query PcgcVariant($variantId: String!, $datasetId: DatasetsSupportingFetchVariantDetails!) {
  variant(variantId: $variantId, dataset: $datasetId) {
    alt
    chrom
    pos
    ref
    variantId
    xpos
    ... on GnomadVariantDetails {
      exome {
        ac
        an
        ac_hom
        populations {
          id
          ac
          an
        }

      }
      sortedTranscriptConsequences {
        canonical
        gene_id
        gene_symbol
        hgvs
        hgvsc
        hgvsp
        lof
        lof_flags
        lof_filter
        lof_info
        major_consequence
        polyphen_prediction
        sift_prediction
        transcript_id
      }
    }
  }
}
`
*/