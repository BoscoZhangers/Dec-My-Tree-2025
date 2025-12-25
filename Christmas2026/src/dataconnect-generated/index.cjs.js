const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'christmas2026',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createPublicListRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePublicList', inputVars);
}
createPublicListRef.operationName = 'CreatePublicList';
exports.createPublicListRef = createPublicListRef;

exports.createPublicList = function createPublicList(dcOrVars, vars) {
  return executeMutation(createPublicListRef(dcOrVars, vars));
};

const getPublicListsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPublicLists');
}
getPublicListsRef.operationName = 'GetPublicLists';
exports.getPublicListsRef = getPublicListsRef;

exports.getPublicLists = function getPublicLists(dc) {
  return executeQuery(getPublicListsRef(dc));
};

const createPrivateListRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePrivateList', inputVars);
}
createPrivateListRef.operationName = 'CreatePrivateList';
exports.createPrivateListRef = createPrivateListRef;

exports.createPrivateList = function createPrivateList(dcOrVars, vars) {
  return executeMutation(createPrivateListRef(dcOrVars, vars));
};

const getMyPrivateListsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyPrivateLists');
}
getMyPrivateListsRef.operationName = 'GetMyPrivateLists';
exports.getMyPrivateListsRef = getMyPrivateListsRef;

exports.getMyPrivateLists = function getMyPrivateLists(dc) {
  return executeQuery(getMyPrivateListsRef(dc));
};
