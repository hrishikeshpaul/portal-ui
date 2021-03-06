import React from 'react';
import Typography from '@material-ui/core/Typography';
import { readCookie } from 'helpers/functions';
import LookupEntity from 'helpers/LookupEntity';
import SearchWrapper from './SearchWrapper';
import './Search.scss';
import { donorConfig, sampleConfig, datasetConfig } from './config';
// eslint-disable-next-line import/named
import { filter } from './utils';
import AncestorNote from './AncestorNote';

const hiddenFilters = [filter('ancestor_ids', 'Ancestor ID'), filter('entity_type', 'Entity Type')];

const filtersByType = {
  '': hiddenFilters,
  donor: donorConfig.filters.concat(hiddenFilters),
  sample: sampleConfig.filters.concat(hiddenFilters),
  dataset: datasetConfig.filters.concat(hiddenFilters),
};

const resultFieldsByType = {
  '': ['status', 'entity_type'],
  donor: donorConfig.fields,
  sample: sampleConfig.fields,
  dataset: datasetConfig.fields,
};

const { searchParams } = new URL(document.location);
const type = (searchParams.get('entity_type[0]') || '').toLowerCase();
const hasAncestorParam = searchParams.has('ancestor_ids[0]');

const nexus_token = readCookie('nexus_token');
const httpHeaders = nexus_token
  ? {
      Authorization: `Bearer ${nexus_token}`,
    }
  : {};
const resultFields = resultFieldsByType[type];
const searchProps = {
  // The default behavior is to add a "_search" path.
  // We don't want that.
  searchUrlPath: '',
  // Pass Globus token:
  httpHeaders,
  // Prefix for details links:
  detailsUrlPrefix: `/browse/${type || 'dataset'}/`,
  // Search results field which will be appended to detailsUrlPrefix:
  idField: 'uuid',
  // Search results fields to display in table:
  resultFields,
  // Default hitsPerPage is 10:
  hitsPerPage: 20,
  // Sidebar facet configuration;
  // "type" should be one of the filters described here:
  // http://docs.searchkit.co/stable/components/navigation/
  filters: filtersByType[type],
  hiddenFilterIds: hiddenFilters.map((hiddenFilter) => hiddenFilter.props.id),
  queryFields: ['everything'],
  isLoggedIn: Boolean(nexus_token),
};

function Search(props) {
  const { title, elasticsearchEndpoint } = props;
  const allProps = Object.assign(searchProps, { apiUrl: elasticsearchEndpoint });

  // eslint-disable-next-line react/jsx-props-no-spreading
  const wrappedSearch = <SearchWrapper {...allProps} />;
  return (
    <>
      <Typography component="h1" variant="h2">
        {title}
      </Typography>
      {hasAncestorParam && (
        <LookupEntity uuid={searchParams.get('ancestor_ids[0]')} elasticsearchEndpoint={elasticsearchEndpoint}>
          <AncestorNote />
        </LookupEntity>
      )}
      {wrappedSearch}
    </>
  );
}

export default Search;
