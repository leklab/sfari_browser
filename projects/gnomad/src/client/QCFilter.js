import PropTypes from 'prop-types'
import React from 'react'

import { Badge } from '@broad/ui'

const FILTER_DESCRIPTIONS = {
  AC0: 'Allele count is zero (i.e. no high-confidence genotype)',
  InbreedingCoeff: 'Has an inbreeding coefficient < -0.3',
  RF: 'Failed random forest filters',
  AS_VQSR: 'Failed allele-specific VQSR filter',
}

const QCFilter = ({ filter }) => (
  <Badge level="warning" tooltip={FILTER_DESCRIPTIONS[filter]}>
    {filter}
  </Badge>
)

QCFilter.propTypes = {
  filter: PropTypes.oneOf(['AC0', 'InbreedingCoeff', 'RF','AS_VQSR']).isRequired,
}

export default QCFilter
