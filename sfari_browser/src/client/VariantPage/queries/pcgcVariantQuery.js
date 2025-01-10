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
      filters
      spark_exome {
        ac
        an
        ac_hom
        ac_male
        an_male
        ac_male_hom
        ac_female
        an_female
        ac_female_hom
        populations {
          id
          ac
          an
          ac_hom
        }
        qualityMetrics{
          alleleBalance {
            alt {
              bin_edges
              bin_freq
              n_smaller
              n_larger
            }
          }
          genotypeDepth {
            all {
              bin_edges
              bin_freq
              n_smaller
              n_larger
            }
            alt {
              bin_edges
              bin_freq
              n_smaller
              n_larger
            }
          }
          genotypeQuality {
            all {
              bin_edges
              bin_freq
              n_smaller
              n_larger
            }
            alt {
              bin_edges
              bin_freq
              n_smaller
              n_larger
            }
          }
        }          
      }
     spark_genome {
        ac
        an
        ac_hom
        ac_male
        an_male
        ac_male_hom
        ac_female
        an_female
        ac_female_hom
        populations {
          id
          ac
          an
          ac_hom
        }
      }
     ssc_genome {
        ac
        an
        ac_hom
        ac_male
        an_male
        ac_male_hom
        ac_female
        an_female
        ac_female_hom
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
      in_silico_predictors {
        cadd
        splice_ai
        primate_ai
        revel
      }
      dis_asd {
        DNA_Disease_impact_score
        RNA_Disease_impact_score
      }
      func_annotation {
        accession
        score
        sigma
      }
    }
  }
}
`
