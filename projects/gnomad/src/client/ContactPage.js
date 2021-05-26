import React from 'react'

import { ExternalLink, PageHeading } from '@broad/ui'

import DocumentTitle from './DocumentTitle'
import InfoPage from './InfoPage'

export default () => (
  <InfoPage>
    <DocumentTitle title="Contact" />
    <PageHeading>Contact</PageHeading>
    <p>
    Report data problems or feature suggestions by <ExternalLink href="mailto:genomebrowser@sfari.org">email</ExternalLink>. <br /><br />
    Report errors in the website on <ExternalLink href="https://github.com/leklab/sfari_browser/issues">GitHub</ExternalLink> or by <ExternalLink href="mailto:genomebrowser@sfari.org">email</ExternalLink>.
    </p>

  </InfoPage>
)
