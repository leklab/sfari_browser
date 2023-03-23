import React from 'react'
import styled from 'styled-components'
import { ExternalLink, PageHeading } from '@broad/ui'

import DocumentTitle from './DocumentTitle'
import InfoPage from './InfoPage'

const Credits = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 13px;

  @media (max-width: 992px) {
    flex-direction: column;
    font-size: 16px;
  }
`

const CreditsSection = styled.div`
  width: calc(${props => props.width} - 15px);

  @media (max-width: 992px) {
    width: 100%;
  }
`

const ContributorList = styled.ul`
  list-style-type: none;
  padding-left: 0;
  line-height: 1.5;

  ul {
    padding-left: 20px;
    margin: 0.5em 0;
    list-style-type: none;
  }
`

const PrincipalInvestigatorList = styled(ContributorList)`
  columns: 2;

  @media (max-width: 992px) {
    columns: 1;
  }
`

const FundingSourceList = styled(ContributorList)`
  li {
    margin-bottom: 1em;
  }
`

const TableStyled = styled.table`
  border: 1px solid black;
  border-collapse: collapse;
`

const TableHeader = styled.th`
  border: 1px solid black;
  border-collapse: collapse;
`

const TableData = styled.td`
  border: 1px solid black;
  border-collapse: collapse;
`


export default () => (
  <InfoPage>
    <DocumentTitle title="About SFARI" />
    <PageHeading id="about-sfari">About SFARI Browser</PageHeading>
    <p>
      <h2>Data</h2>
        Summary data are available for the following datasets:<br /><br />
        <TableStyled>
          <tr><TableHeader>Data Set</TableHeader><TableHeader>Samples</TableHeader></tr>
          <tr><TableData>SSC Genomes</TableData><TableData>9,209</TableData></tr>
          <tr><TableData>SPARK Genomes</TableData><TableData>2,629</TableData></tr>
          <tr><TableData>SPARK Exomes</TableData><TableData>106,744</TableData></tr>

        </TableStyled>
        <br />
        The VCF data (in GRCh38) from each of these data sets were processed using a hail pipeline for filtering, calculating summary metrics and annnotation by Variant Effect Predictor (VEP).
        Visit the <ExternalLink href="https://github.com/leklab/sfari_hail">github repository</ExternalLink> for more information on the processing pipeline and hail code. 
        <br /><br />
        All variant summary data presented here are made available to the wider research community for variant and gene level visualization. For detailed information (including individual data) on released datasets and other available resources, please apply to access through <ExternalLink href="https://base.sfari.org">SFARI Base</ExternalLink>.        
        </p>
    <p>
      <h2>Development Team</h2>
      The <ExternalLink href="https://github.com/leklab/sfari_browser">SFARI Browser code</ExternalLink> is based on the <ExternalLink href="https://github.com/broadinstitute/gnomad-browser">gnomAD Browser</ExternalLink> and developed by Monkol Lek (Yale University) in collaboration with Natalia Volfovsky (Simons Foundation).
    </p>

    <p>
      <h2>Funding</h2>
      This work has been generously funded by a Simons Foundation grant awarded to Monkol Lek.
    </p>

  </InfoPage>
)
