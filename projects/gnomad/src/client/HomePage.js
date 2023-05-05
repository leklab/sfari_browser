import React from 'react'
import styled from 'styled-components'

import { ExternalLink } from '@broad/ui'

import DocumentTitle from './DocumentTitle'
import InfoPage from './InfoPage'
import Link from './Link'
import Searchbox from './Searchbox'
import GnomadHeading from './GnomadHeading'

const HomePage = styled(InfoPage)`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 740px;
  margin-top: 90px;
`

const HeadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 40px;
`

const SubHeading = styled.h2`
  padding-top: 0;
  padding-bottom: 0;
  font-size: 1.2em;
  font-weight: lighter;
  letter-spacing: 2px;
  text-align: center;
`

export default () => (
  <HomePage>
    <DocumentTitle />
    <HeadingContainer>
      {/* <GnomadHeading width="60%" /> */}
      <img src="https://genomes.sfari.org/SFARI.png" width="50%" height="50%"></img>
      <SubHeading>Simons Foundation Autism Research Initiative</SubHeading>
      <Searchbox width="100%" />
      <p>
        Examples - Gene:{' '}
        <Link preserveSelectedDataset={false} to="/gene/CHD8">
          CHD8
        </Link>
        , Variant:{' '}
        <Link preserveSelectedDataset={false} to="/variant/14-21385928-C-T">
          14-21385928-C-T
        </Link>
      </p>
    </HeadingContainer>
    <video width="384" height="240" controls allowfullscreen>
      <source src="/readviz/SFARI_browser_demo_20230324.mp4" type="video/mp4" />
    </video>
    <p>
    The SFARI Genomes Browser is a resource developed for integration and visualization of exome and genome sequencing data generated on <ExternalLink href="https://www.sfari.org">SFARI</ExternalLink> cohorts: <ExternalLink href="https://www.sfari.org/resource/simons-simplex-collection">Simons Simplex Collection (SSC)</ExternalLink>, <ExternalLink href="https://www.sfari.org/resource/spark">SPARK</ExternalLink> and <ExternalLink href="https://www.sfari.org/resource/simons-searchlight">Simons Searchlight</ExternalLink>.
    <br /><br />
    Summary data are available for the following datasets:<br />
    <ul>
    <li> SSC whole genome sequencing data for ~10,000 individuals – sequenced by New York Genome Center (NYGC), and variant calling performed by the Centers of Common Disease Genomics (CCDG) using their analysis pipeline </li>
    <li> SPARK whole genome sequencing data for ~2,500 individuals – sequenced by NYGC, and variant calling performed by the CCDG using their analysis pipeline </li>
    <li> SPARK whole exome sequencing data for ~106,000 individuals – sequenced by Regeneron Pharmaceuticals, and variant calling and annotation performed by the SPARK Genome Consortium. </li>
    </ul>
    <br />
    All variant summary data presented here are made available to the wider research community for variant and gene level visualization. For detailed information (including individual data) on released datasets and other available resources, please apply to access through <ExternalLink href="https://base.sfari.org">SFARI Base</ExternalLink>.
    </p>
  </HomePage>
)
