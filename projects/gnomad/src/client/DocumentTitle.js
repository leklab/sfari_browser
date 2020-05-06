import PropTypes from 'prop-types'
import { useEffect } from 'react'

const DocumentTitle = ({ title }) => {
  useEffect(
    () => {
      const fullTitle = title ? `${title} | SFARI` : 'SFARI'
      document.title = fullTitle
    },
    [title]
  )
  return null
}

DocumentTitle.propTypes = {
  title: PropTypes.string,
}

DocumentTitle.defaultProps = {
  title: null,
}

export default DocumentTitle
