import throttle from 'lodash.throttle'
import memoizeOne from 'memoize-one'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { NavigatorTrack } from '@broad/track-navigator'

import datasetLabels from '../datasetLabels'
import { Query } from '../Query'
import StatusMessage from '../StatusMessage'
import { TrackPageSection } from '../TrackPage'
// import ExportVariantsButton from '../MitoVariantList/ExportVariantsButton'
import filterVariants from '../MitoVariantList/filterVariants'
import mergeExomeAndGenomeData from '../MitoVariantList/mergeExomeAndGenomeData'
import sortVariants from '../MitoVariantList/sortVariants'
import VariantFilterControls from '../MitoVariantList/VariantFilterControls'
import VariantTable from '../MitoVariantList/VariantTable'
import { getColumns } from '../MitoVariantList/variantTableColumns'
import VariantTrack from '../MitoVariantList/VariantTrack'
import ClinVarTrack from './ClinVarTrack'

class MitoVariantsInGene extends Component {
  static propTypes = {
    datasetId: PropTypes.string.isRequired,
    gene: PropTypes.shape({
      chrom: PropTypes.string.isRequired,
      gene_id: PropTypes.string.isRequired,
    }).isRequired,
    transcriptId: PropTypes.string,
    variants: PropTypes.arrayOf(PropTypes.object).isRequired,
    width: PropTypes.number.isRequired,
  }

  static defaultProps = {
    transcriptId: undefined,
  }

  constructor(props) {
    super(props)

    const defaultFilter = {
      includeCategories: {
        lof: true,
        missense: true,
        synonymous: true,
        other: true,
      },
      includeFilteredVariants: false,
      includeSNVs: true,
      includeIndels: true,
      includeExomes: true,
      includeGenomes: true,
      searchText: '',
    }

    const defaultSortKey = 'variant_id'
    const defaultSortOrder = 'ascending'

    const renderedVariants = mergeExomeAndGenomeData(props.variants)

    console.log("Printing renderedVariants")
    console.log(renderedVariants)

    this.state = {
      filter: defaultFilter,
      hoveredVariant: null,
      rowIndexLastClickedInNavigator: 0,
      renderedVariants,
      sortKey: defaultSortKey,
      sortOrder: defaultSortOrder,
      visibleVariantWindow: [0, 19],
    }
  }

  getColumns = memoizeOne((width, chrom) =>
    getColumns({
      width,
      includeHomozygoteAC: false,
      includeHemizygoteAC: false,
    })
  )

  onFilter = newFilter => {
    this.setState(state => {
      const { variants } = this.props
      const { sortKey, sortOrder } = state
      const renderedVariants = sortVariants(
        mergeExomeAndGenomeData(filterVariants(variants, newFilter)),
        {
          sortKey,
          sortOrder,
        }
      )
      return {
        filter: newFilter,
        renderedVariants,
      }
    })
  }

  onSort = newSortKey => {
    this.setState(state => {
      const { renderedVariants, sortKey } = state

      let newSortOrder = 'descending'
      if (newSortKey === sortKey) {
        newSortOrder = state.sortOrder === 'ascending' ? 'descending' : 'ascending'
      }

      // Since the filter hasn't changed, sort the currently rendered variants instead
      // of filtering the input variants.
      const sortedVariants = sortVariants(renderedVariants, {
        sortKey: newSortKey,
        sortOrder: newSortOrder,
      })

      return {
        renderedVariants: sortedVariants,
        sortKey: newSortKey,
        sortOrder: newSortOrder,
      }
    })
  }

  onHoverVariant = variantId => {
    this.setState({ hoveredVariant: variantId })
  }

  onVisibleRowsChange = throttle(({ startIndex, stopIndex }) => {
    this.setState({ visibleVariantWindow: [startIndex, stopIndex] })
  }, 100)

  onNavigatorClick = position => {
    const { renderedVariants } = this.state
    const sortedVariants = sortVariants(renderedVariants, {
      sortKey: 'variant_id',
      sortOrder: 'ascending',
    })

    let index
    if (sortedVariants.length === 0 || position < sortedVariants[0].pos) {
      index = 0
    }

    index = sortedVariants.findIndex(
      (variant, i) =>
        sortedVariants[i + 1] && position >= variant.pos && position <= sortedVariants[i + 1].pos
    )

    if (index === -1) {
      index = sortedVariants.length - 1
    }

    this.setState({
      renderedVariants: sortedVariants,
      rowIndexLastClickedInNavigator: index,
      sortKey: 'variant_id',
      sortOrder: 'ascending',
    })
  }

  render() {

    const { datasetId, gene, transcriptId, width } = this.props

    const {
      filter,
      hoveredVariant,
      renderedVariants,
      rowIndexLastClickedInNavigator,
      sortKey,
      sortOrder,
      visibleVariantWindow,
    } = this.state

    const datasetLabel = datasetLabels[datasetId]

    return (
      <div>

        <VariantTrack
          title={`SFARI Mito Variants (${renderedVariants.length})`}
          variants={renderedVariants}
        />
        <NavigatorTrack
          hoveredVariant={hoveredVariant}
          onNavigatorClick={this.onNavigatorClick}
          title="Viewing in table"
          variants={renderedVariants}
          visibleVariantWindow={visibleVariantWindow}
        />
        <TrackPageSection style={{ fontSize: '14px', marginTop: '1em' }}>
          <VariantFilterControls onChange={this.onFilter} value={filter} />
          {!transcriptId && (
            <p style={{ marginBottom: 0 }}>
              † denotes a consequence that is for a non-canonical transcript
            </p>
          )}
          <p style={{ marginBottom: 0 }}>
            <b>Cohort Key:</b>&nbsp; <img
                    src={require('../MitoVariantList/SPARK_icon.png').default}
                    height={20}
                    width={20}
                    alt={"SPARK"}
                  />&nbsp; SPARK &nbsp; &nbsp; &nbsp; 
                  <img
                    src={require('../MitoVariantList/SSC_icon.png').default}
                    height={20}
                    width={20}
                    alt={"SSC"}
                  />&nbsp; SSC
          </p>
           <VariantTable
            columns={this.getColumns(width, gene.chrom)}
            highlightText={filter.searchText}
            onHoverVariant={this.onHoverVariant}
            onRequestSort={this.onSort}
            onVisibleRowsChange={this.onVisibleRowsChange}
            rowIndexLastClickedInNavigator={rowIndexLastClickedInNavigator}
            sortKey={sortKey}
            sortOrder={sortOrder}
            variants={renderedVariants}
          />
        </TrackPageSection>
      </div>
    )
  }
}

const ConnectedMitoVariantsInGene = ({ datasetId, gene, transcriptId, width }) => {
  // const transcriptArg = transcriptId ? `, transcriptId: "${transcriptId}"` : ''

  
  const query = `{
    mito_gene(gene_id: "${gene.gene_id}") {
      variants {
        consequence
        flags
        hgvs
        hgvsp
        hgvsc
        ${transcriptId ? '' : 'isCanon: consequence_in_canonical_transcript'}
        pos
        variant_id: variantId
        xpos
        spark_genome {
          ac
          an
          af
          ac_hom
          ac_het
          max_heteroplasmy
        }
        ssc_genome {
          ac
          an
          af
          ac_hom
          ac_het
          max_heteroplasmy
        }
      }
    }
  }`
  
  
  return (
    <Query query={query}>
      {({ data, error, graphQLErrors, loading }) => {

        if (loading) {
          return <StatusMessage>Loading variants...</StatusMessage>
        }

        if (error || !((data || {}).mito_gene || {}).variants) {
          return <StatusMessage>Failed to load variants</StatusMessage>
        }

        return (
          <MitoVariantsInGene
            datasetId={datasetId}
            gene={gene}
            transcriptId={transcriptId}
            variants={data.mito_gene.variants}
            width={width}
          />
        )
      }}
    </Query>
  )
}


ConnectedMitoVariantsInGene.propTypes = {
  datasetId: PropTypes.string.isRequired,
  gene: PropTypes.shape({
    gene_id: PropTypes.string.isRequired,
  }).isRequired,
  transcriptId: PropTypes.string,
  width: PropTypes.number.isRequired,
}

ConnectedMitoVariantsInGene.defaultProps = {
  transcriptId: undefined,
}

export default ConnectedMitoVariantsInGene
