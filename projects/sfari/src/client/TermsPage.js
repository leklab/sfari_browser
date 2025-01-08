import React from 'react'
import { ExternalLink, PageHeading } from '@broad/ui'
import DocumentTitle from './DocumentTitle'
import InfoPage from './InfoPage'

export default () => (
  <InfoPage>
    <DocumentTitle title="Terms and Data Information" />
    <PageHeading>Terms and Data Information</PageHeading>

    <h2>Terms of use</h2>
    Please refer to the terms page on the <ExternalLink href="https://www.simonsfoundation.org/terms-and-conditions">Simons Foundation website</ExternalLink>
  </InfoPage>
)
