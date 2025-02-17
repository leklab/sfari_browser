import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import { Page } from '@broad/ui'
import { Badge, TooltipAnchor, TooltipHint, BaseTable, ExternalLink } from '@broad/ui'
import QCFilter from '../QCFilter'

import DocumentTitle from '../DocumentTitle'
import GnomadPageHeading from '../GnomadPageHeading'
import Link from '../Link'
import StatusMessage from '../StatusMessage'
import { ReferenceList } from './ReferenceList'

// import ReadData from '../ReadData/ReadData'
import MitoReadData from '../ReadData/MitoReadData'
import { PcgcPopulationsTable } from './PcgcPopulationsTable'


import { GnomadGenotypeQualityMetrics } from './qualityMetrics/GnomadGenotypeQualityMetrics'

import { TranscriptConsequenceList } from './TranscriptConsequenceList'
import { VariantDetailsQuery } from './VariantDetailsQuery'
import VariantNotFound from './VariantNotFound'
import { GnomadVariantOccurrenceTable } from './VariantOccurrenceTable'


import VariantInSilicoPredictors from './VariantInSilicoPredictors'

const Section = styled.section`
  width: 100%;
`

const ResponsiveSection = styled(Section)`
  width: calc(50% - 15px);

  @media (max-width: 992px) {
    width: 100%;
  }
`

const VariantDetailsContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
`

const ScrollWrapper = styled.div`
  overflow-x: auto;
`

const DenovoSection = styled.div`
  color:red;

`
const Table = styled(BaseTable)`
  @media (max-width: 600px) {
    td,
    th {
      padding-right: 10px;

      /* Drop sparkline column */
      &:nth-child(5) {
        display: none;
      }
    }
  }
`

const VariantType = ({ variantId }) => {
  const [chrom, pos, ref, alt] = variantId.split('-') // eslint-disable-line no-unused-vars
  if (!ref || !alt) {
    return 'Variant'
  }
  if (ref.length === 1 && alt.length === 1) {
    return 'Single nucleotide variant'
  }
  if (ref.length < alt.length) {
    return 'Insertion'
  }
  if (ref.length > alt.length) {
    return 'Deletion'
  }
  return 'Variant'
}

const VariantId = styled.span`
  white-space: nowrap;
`

//const renderGnomadVariantFlag = (variant, exomeOrGenome) => {
const renderGnomadVariantFlag = (variant) => {

  /*
  if (!variant[exomeOrGenome]) {
    return <Badge level="error">No variant</Badge>
  }
  */
  const filters = variant.filters  

  if(!filters){
    return <Badge level="info">Not in gnomAD</Badge>
  }
  
  else if (filters.length === 0) {
    return <Badge level="success">Pass</Badge>
  }
  return filters.map(filter => <QCFilter key={filter} filter={filter} />)
}

export const renderRoundedNumber = (
  num,
  precision = 1,
  tooltipPrecision = 3,
  highlightColor = null
) => {
  if (num === null) {
    return '—'
  }

  const roundedNumber = Number(num.toFixed(precision)).toString()
  return (
    <TooltipAnchor tooltip={num.toFixed(tooltipPrecision)}>
      {highlightColor ? (
        <ConstraintHighlight highlightColor={highlightColor}>{roundedNumber}</ConstraintHighlight>
      ) : (
        <TooltipHint>{roundedNumber}</TooltipHint>
      )}
    </TooltipAnchor>
  )
}

const Graph = ({ value, lower, upper, min, max, color }) => {
  //const width = 60
  // const xPadding = 13

  const width = 140
  const xPadding = 20

  const interval = (width-xPadding*2)/(max - min)

  //const x = n => Math.max(0, Math.min(xPadding + n * (width - xPadding * 2), width - xPadding))
  const x = n => xPadding + (n - min)*interval


  //const y = 18
  const y = 23


  return (
    <svg height={30} width={width}>
      <text x={0} y={26} fontSize="12px" textAnchor="start">
        {min}
      </text>
      <line x1={xPadding} y1={30} x2={width - xPadding} y2={30} stroke="#333" />

      <rect x={x(lower)} y={y - 7} height={14} width={x(upper) - x(lower)} fill="#aaa" />
      <circle
        cx={x(value)}
        cy={y}
        r={3}
        strokeWidth={1}
        stroke="#000"
        fill={color || '#e2e2e2'}
      />
      <text x={width} y={26} fontSize="12px" textAnchor="end">
        {max}
      </text>
    </svg>
  )
}

Graph.propTypes = {
  value: PropTypes.number.isRequired,
  lower: PropTypes.number.isRequired,
  upper: PropTypes.number.isRequired,
  color: PropTypes.string,
}

Graph.defaultProps = {
  color: undefined,
}



const PcgcVariantPage = ({ datasetId, variantId }) => (
  <Page>
    <DocumentTitle title={variantId} />
    <GnomadPageHeading
      datasetOptions={{ includeExac: false, includeStructuralVariants: false }}
      selectedDataset={datasetId}
    >
      <VariantType variantId={variantId} />: <VariantId>{variantId}</VariantId>
    </GnomadPageHeading>
    <VariantDetailsQuery datasetId={datasetId} variantId={variantId}>
      {({ data, error, loading }) => {
        if (loading) {
          return <StatusMessage>Loading variant...</StatusMessage>
        }

        if (error) {
          return <StatusMessage>Unable to load variant</StatusMessage>
        }

        if (!data.variant) {
          return <VariantNotFound datasetId={datasetId} variantId={variantId} />
        }

        const { variant } = data

        const numTranscripts = variant.sortedTranscriptConsequences.length
        const geneIds = variant.sortedTranscriptConsequences.map(csq => csq.gene_id)
        const numGenes = new Set(geneIds).size

        let dnm_confidence

        if(variant.denovoHC && variant.denovoHC == 'Yes'){
          dnm_confidence = 'HIGH'
        }
        else if(variant.denovoHC && variant.denovoHC == 'No'){
          dnm_confidence = 'LOW'                    
        }
        else if(variant.denovoHC && variant.denovoHC == 'Unclassified'){
          dnm_confidence = 'UNKNOWN'                                        
        }

        // const dnm_confidence = variant.denovoHC && variant.denovoHC == 'Yes' ? 'HIGH' : 'LOW'

        console.log("Ih here 2")
        console.log(variant)

        return (
          <VariantDetailsContainer>
            <ResponsiveSection>
              <ScrollWrapper>
                <GnomadVariantOccurrenceTable variant={variant} />
                <p>
                <h3>gnomAD Filters: {renderGnomadVariantFlag(variant)}</h3>
                </p>


              </ScrollWrapper>
              {variant.colocatedVariants.length > 0 && (
                <div>
                  <p>
                    <strong>This variant is multiallelic. Other alt alleles are:</strong>
                  </p>
                  <ul>
                    {variant.colocatedVariants.map(variantId => (
                      <li key={variantId}>
                        <Link to={`/variant/${variantId}`}>{variantId}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {variant.denovoHC && (
                <DenovoSection>
                  <p>
                    <strong>This is a {dnm_confidence} confidence de novo variant</strong>
                  </p>
                </DenovoSection>
              )}

              {variant.dis_asd && (
                <p>
                <h3>Non-coding scores from Human Base</h3>
                <b>DNA Disease impact score:</b> {variant.dis_asd.DNA_Disease_impact_score}<br />
                <b>RNA Disease impact score:</b> {variant.dis_asd.RNA_Disease_impact_score}

                </p>
              )}

              {variant.func_annotation && (
                <p>
                <h3>Functional Annotation</h3>
                <Table>
                  <thead>
                    <tr>
                      <th scope="col">Source</th>
                      <th scope="col">Accession</th>
                      <th scope="col">Score</th>
                      <th scope="col">Sigma</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>MaveDB</td>
                      <td><ExternalLink href={`https://mavedb.org/score-sets/${variant.func_annotation.accession}`}>
                        {variant.func_annotation.accession}
                        </ExternalLink></td>
                      <td>{renderRoundedNumber(variant.func_annotation.score,3,3)}</td>
                      <td>{renderRoundedNumber(variant.func_annotation.sigma,3,3)}</td>
                      <td>
                      <Graph lower={variant.func_annotation.score-variant.func_annotation.sigma} 
                              upper={variant.func_annotation.score+variant.func_annotation.sigma} 
                              value={variant.func_annotation.score} 
                              min={Number(variant.func_annotation.min.toFixed(2))} 
                              max={Number(variant.func_annotation.max.toFixed(2))} color={'#ff9300'} />
                      </td>
                    </tr>
                  </tbody>
                </Table>
                </p>
              )}

              
              {/*variant.multiNucleotideVariants.length > 0 && (
                <div>
                  <p>
                    <strong>
                      This variant&apos;s consequence may be affected by other variants:
                    </strong>
                  </p>
                  <MNVSummaryList multiNucleotideVariants={variant.multiNucleotideVariants} />
                </div>
              )*/}
            </ResponsiveSection>
            <ResponsiveSection>
              <h2>References</h2>
              <ReferenceList variant={variant} />
              {/*<h2>Report</h2>
              <VariantFeedback datasetId={datasetId} variantId={variantId} />*/}
            </ResponsiveSection>
            <Section>
              <h2>Annotations</h2>
              <p>
                This variant falls on {numTranscripts} transcript
                {numTranscripts !== 1 && 's'} in {numGenes} gene
                {numGenes !== 1 && 's'}.
              </p>
              <TranscriptConsequenceList
                sortedTranscriptConsequences={variant.sortedTranscriptConsequences}
              />
              {!!variant.in_silico_predictors && (
              <div>
              <h2>In Silico Predictors</h2>
              <VariantInSilicoPredictors variant={variant} />
              </div>
              )}
            </Section>
            <ResponsiveSection>
              <h2>Population Frequencies</h2>
              <ScrollWrapper>
                <PcgcPopulationsTable
                  exomePopulations={variant.spark_exome ? variant.spark_exome.populations : []}
                  genomePopulations={variant.spark_genome ? variant.spark_genome.populations : []}
                  sscGenomePopulations={variant.ssc_genome ? variant.ssc_genome.populations : []}
                  gnomadPopulations={variant.gnomadPopFreq ? variant.gnomadPopFreq : []}
                  gnomadAF={variant.gnomadAF ? variant.gnomadAF : 0}
                  exome_male_ac={variant.spark_exome ? variant.spark_exome.ac_male : 0}
                  exome_male_ac_hom={variant.spark_exome ? variant.spark_exome.ac_male_hom : 0}
                  exome_male_an={variant.spark_exome ? variant.spark_exome.an_male : 0}
                  exome_female_ac={variant.spark_exome ? variant.spark_exome.ac_female : 0}
                  exome_female_ac_hom={variant.spark_exome ? variant.spark_exome.ac_female_hom : 0}
                  exome_female_an={variant.spark_exome ? variant.spark_exome.an_female : 0}
                  genome_male_ac={variant.spark_genome ? variant.spark_genome.ac_male : 0}
                  genome_male_ac_hom={variant.spark_genome ? variant.spark_genome.ac_male_hom : 0}
                  genome_male_an={variant.spark_genome ? variant.spark_genome.an_male : 0}
                  genome_female_ac={variant.spark_genome ? variant.spark_genome.ac_female : 0}
                  genome_female_ac_hom={variant.spark_genome ? variant.spark_genome.ac_female_hom : 0}
                  genome_female_an={variant.spark_genome ? variant.spark_genome.an_female : 0}
                  ssc_genome_male_ac={variant.ssc_genome ? variant.ssc_genome.ac_male : 0}
                  ssc_genome_male_ac_hom={variant.ssc_genome ? variant.ssc_genome.ac_male_hom : 0}
                  ssc_genome_male_an={variant.ssc_genome ? variant.ssc_genome.an_male : 0}
                  ssc_genome_female_ac={variant.ssc_genome ? variant.ssc_genome.ac_female : 0}
                  ssc_genome_female_ac_hom={variant.ssc_genome ? variant.ssc_genome.ac_female_hom : 0}
                  ssc_genome_female_an={variant.ssc_genome ? variant.ssc_genome.an_female : 0}
                  // showHemizygotes={variant.chrom === 'X' || variant.chrom === 'Y'}
                />
              </ScrollWrapper>
            </ResponsiveSection>
            {/*<ResponsiveSection>
              <h2>Age Distribution</h2>
              {datasetId !== 'gnomad_r2_1' && (
                <p>
                  Age distribution is based on the full gnomAD dataset, not the selected subset.
                </p>
              )}
              <GnomadAgeDistribution variant={variant} />
            </ResponsiveSection>*/}

            { !!variant.spark_exome && (
            <ResponsiveSection>
              <h2>Genotype Quality Metrics</h2>
              <GnomadGenotypeQualityMetrics variant={variant} />
            </ResponsiveSection>
            )}
            {/*<ResponsiveSection>
              <h2>Site Quality Metrics</h2>
              <GnomadSiteQualityMetrics datasetId={datasetId} variant={variant} />
            </ResponsiveSection>
            <Section>
              <h2>Read Data</h2>
              <GnomadReadData
                exomeReads={(variant.exome || {}).reads || []}
                genomeReads={(variant.genome || {}).reads || []}
                igvLocus={`${variant.chrom}:${variant.pos - 40}-${variant.pos + 40}`}
                showHemizygotes={variant.chrom === 'X' || variant.chrom === 'Y'}
              />
            </Section>*/}

          <Section>
            <h2>Read Data</h2>
            <MitoReadData variantIds={[variantId]} />
          </Section>

          </VariantDetailsContainer>
        )
      }}
    </VariantDetailsQuery>
  </Page>
)

PcgcVariantPage.propTypes = {
  datasetId: PropTypes.string.isRequired,
  variantId: PropTypes.string.isRequired,
}

export default PcgcVariantPage
