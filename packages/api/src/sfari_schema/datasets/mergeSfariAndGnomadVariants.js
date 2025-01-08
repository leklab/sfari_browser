const mergeSfariAndGnomadVariantSummaries = (sfariVariants, gnomadVariants) => {
  const mergedVariants = []

  while (sfariVariants.length) {
    const currentsfariVariant = sfariVariants[0]
    const currentGnomadVariant = gnomadVariants[0]

    if (currentGnomadVariant === undefined) {
      mergedVariants.push(sfariVariants.shift())
    }
    else if (currentsfariVariant === undefined) {
      gnomadVariants.shift()
    }
    else if (currentsfariVariant.pos < currentGnomadVariant.pos) {
      mergedVariants.push(sfariVariants.shift())
    }
    else if (currentGnomadVariant.pos < currentsfariVariant.pos) {
      gnomadVariants.shift()
    }
    else {
      const currentPosition = currentsfariVariant.pos

      const sfariVariantsAtThisPosition = []

      while (sfariVariants.length && sfariVariants[0].pos === currentPosition) {
        sfariVariantsAtThisPosition.push(sfariVariants.shift())
      }
      const gnomadVariantsAtThisPosition = []

      while (gnomadVariants.length && gnomadVariants[0].pos === currentPosition) {
        gnomadVariantsAtThisPosition.push(gnomadVariants.shift())
      }

      sfariVariantsAtThisPosition.sort((v1, v2) => v1.variantId.localeCompare(v2.variantId))
      gnomadVariantsAtThisPosition.sort((v1, v2) => v1.variantId.localeCompare(v2.variantId))

      while (sfariVariantsAtThisPosition.length || gnomadVariantsAtThisPosition.length) {
        const currentsfariVariantAtThisPosition = sfariVariantsAtThisPosition[0]
        const currentGnomadVariantAtThisPosition = gnomadVariantsAtThisPosition[0]

        if (currentGnomadVariantAtThisPosition === undefined) {
          mergedVariants.push(sfariVariantsAtThisPosition.shift())
        }
        else if (currentsfariVariantAtThisPosition === undefined) {
          gnomadVariantsAtThisPosition.shift()
        }
        else if (currentsfariVariantAtThisPosition.variantId.localeCompare(currentGnomadVariantAtThisPosition.variantId) < 0) {
          mergedVariants.push(sfariVariantsAtThisPosition.shift())
        }
        else if (currentsfariVariantAtThisPosition.variantId.localeCompare(currentGnomadVariantAtThisPosition.variantId) > 0) {
          gnomadVariantsAtThisPosition.shift()
        }
        else {
          const tmp_gnomad = gnomadVariantsAtThisPosition.shift()
          const tmp_push = sfariVariantsAtThisPosition.shift()

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

export default mergeSfariAndGnomadVariantSummaries
