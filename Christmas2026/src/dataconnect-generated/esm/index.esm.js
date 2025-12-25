import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'christmas2026',
  location: 'us-east4'
};

export const createPublicListRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePublicList', inputVars);
}
createPublicListRef.operationName = 'CreatePublicList';

export function createPublicList(dcOrVars, vars) {
  return executeMutation(createPublicListRef(dcOrVars, vars));
}

export const getPublicListsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPublicLists');
}
getPublicListsRef.operationName = 'GetPublicLists';

export function getPublicLists(dc) {
  return executeQuery(getPublicListsRef(dc));
}

export const createPrivateListRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePrivateList', inputVars);
}
createPrivateListRef.operationName = 'CreatePrivateList';

export function createPrivateList(dcOrVars, vars) {
  return executeMutation(createPrivateListRef(dcOrVars, vars));
}

export const getMyPrivateListsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyPrivateLists');
}
getMyPrivateListsRef.operationName = 'GetMyPrivateLists';

export function getMyPrivateLists(dc) {
  return executeQuery(getMyPrivateListsRef(dc));
}

