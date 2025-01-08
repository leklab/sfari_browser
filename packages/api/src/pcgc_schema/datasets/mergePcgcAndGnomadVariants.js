const mergePcgcAndGnomadVariantSummaries = (pcgcVariants, gnomadVariants) => {
  const mergedVariants = []

  while (pcgcVariants.length) {
    const currentPcgcVariant = pcgcVariants[0]
    const currentGnomadVariant = gnomadVariants[0]

    if (currentGnomadVariant === undefined) {
      mergedVariants.push(pcgcVariants.shift())
    }
    else if (currentPcgcVariant === undefined) {
      gnomadVariants.shift()
    }
    else if (currentPcgcVariant.pos < currentGnomadVariant.pos) {
      mergedVariants.push(pcgcVariants.shift())
    }
    else if (currentGnomadVariant.pos < currentPcgcVariant.pos) {
      gnomadVariants.shift()
    }
    else {
      const currentPosition = currentPcgcVariant.pos

      const pcgcVariantsAtThisPosition = []

      while (pcgcVariants.length && pcgcVariants[0].pos === currentPosition) {
        pcgcVariantsAtThisPosition.push(pcgcVariants.shift())
      }
      const gnomadVariantsAtThisPosition = []

      while (gnomadVariants.length && gnomadVariants[0].pos === currentPosition) {
        gnomadVariantsAtThisPosition.push(gnomadVariants.shift())
      }

      pcgcVariantsAtThisPosition.sort((v1, v2) => v1.variantId.localeCompare(v2.variantId))
      gnomadVariantsAtThisPosition.sort((v1, v2) => v1.variantId.localeCompare(v2.variantId))

      while (pcgcVariantsAtThisPosition.length || gnomadVariantsAtThisPosition.length) {
        const currentPcgcVariantAtThisPosition = pcgcVariantsAtThisPosition[0]
        const currentGnomadVariantAtThisPosition = gnomadVariantsAtThisPosition[0]

        if (currentGnomadVariantAtThisPosition === undefined) {
          mergedVariants.push(pcgcVariantsAtThisPosition.shift())
        }
        else if (currentPcgcVariantAtThisPosition === undefined) {
          gnomadVariantsAtThisPosition.shift()
        }
        else if (currentPcgcVariantAtThisPosition.variantId.localeCompare(currentGnomadVariantAtThisPosition.variantId) < 0) {
          mergedVariants.push(pcgcVariantsAtThisPosition.shift())
        }
        else if (currentPcgcVariantAtThisPosition.variantId.localeCompare(currentGnomadVariantAtThisPosition.variantId) > 0) {
          gnomadVariantsAtThisPosition.shift()
        }
        else {
          const tmp_gnomad = gnomadVariantsAtThisPosition.shift()
          const tmp_push = pcgcVariantsAtThisPosition.shift()

          if (tmp_gnomad.exome) {
            tmp_push.ac_gnomad += tmp_gnomad.exome.ac
            tmp_push.an_gnomad += tmp_gnomad.exome.an
          }

          if (tmp_gnomad.genome) {
            tmp_push.ac_gnomad += tmp_gnomad.genome.ac
            tmp_push.an_gnomad += tmp_gnomad.genome.an
            if (tmp_gnomad.genome.filters && tmp_gnomad.genome.filters.length > 0) {
              tmp_push.flags.push('filtered')
            }
          }

          if (tmp_gnomad.rsid) {
            tmp_push.rsid = tmp_gnomad.rsid
          }

          mergedVariants.push(tmp_push)
        }
      }
    }
  }
  return mergedVariants
}

export default mergePcgcAndGnomadVariantSummaries
