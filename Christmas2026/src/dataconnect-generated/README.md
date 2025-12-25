# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetPublicLists*](#getpubliclists)
  - [*GetMyPrivateLists*](#getmyprivatelists)
- [**Mutations**](#mutations)
  - [*CreatePublicList*](#createpubliclist)
  - [*CreatePrivateList*](#createprivatelist)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetPublicLists
You can execute the `GetPublicLists` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getPublicLists(): QueryPromise<GetPublicListsData, undefined>;

interface GetPublicListsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetPublicListsData, undefined>;
}
export const getPublicListsRef: GetPublicListsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPublicLists(dc: DataConnect): QueryPromise<GetPublicListsData, undefined>;

interface GetPublicListsRef {
  ...
  (dc: DataConnect): QueryRef<GetPublicListsData, undefined>;
}
export const getPublicListsRef: GetPublicListsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPublicListsRef:
```typescript
const name = getPublicListsRef.operationName;
console.log(name);
```

### Variables
The `GetPublicLists` query has no variables.
### Return Type
Recall that executing the `GetPublicLists` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPublicListsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetPublicListsData {
  lists: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & List_Key)[];
}
```
### Using `GetPublicLists`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPublicLists } from '@dataconnect/generated';


// Call the `getPublicLists()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPublicLists();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPublicLists(dataConnect);

console.log(data.lists);

// Or, you can use the `Promise` API.
getPublicLists().then((response) => {
  const data = response.data;
  console.log(data.lists);
});
```

### Using `GetPublicLists`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPublicListsRef } from '@dataconnect/generated';


// Call the `getPublicListsRef()` function to get a reference to the query.
const ref = getPublicListsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPublicListsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.lists);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.lists);
});
```

## GetMyPrivateLists
You can execute the `GetMyPrivateLists` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMyPrivateLists(): QueryPromise<GetMyPrivateListsData, undefined>;

interface GetMyPrivateListsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyPrivateListsData, undefined>;
}
export const getMyPrivateListsRef: GetMyPrivateListsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyPrivateLists(dc: DataConnect): QueryPromise<GetMyPrivateListsData, undefined>;

interface GetMyPrivateListsRef {
  ...
  (dc: DataConnect): QueryRef<GetMyPrivateListsData, undefined>;
}
export const getMyPrivateListsRef: GetMyPrivateListsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyPrivateListsRef:
```typescript
const name = getMyPrivateListsRef.operationName;
console.log(name);
```

### Variables
The `GetMyPrivateLists` query has no variables.
### Return Type
Recall that executing the `GetMyPrivateLists` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyPrivateListsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMyPrivateListsData {
  lists: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & List_Key)[];
}
```
### Using `GetMyPrivateLists`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyPrivateLists } from '@dataconnect/generated';


// Call the `getMyPrivateLists()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyPrivateLists();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyPrivateLists(dataConnect);

console.log(data.lists);

// Or, you can use the `Promise` API.
getMyPrivateLists().then((response) => {
  const data = response.data;
  console.log(data.lists);
});
```

### Using `GetMyPrivateLists`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyPrivateListsRef } from '@dataconnect/generated';


// Call the `getMyPrivateListsRef()` function to get a reference to the query.
const ref = getMyPrivateListsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyPrivateListsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.lists);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.lists);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreatePublicList
You can execute the `CreatePublicList` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createPublicList(vars: CreatePublicListVariables): MutationPromise<CreatePublicListData, CreatePublicListVariables>;

interface CreatePublicListRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePublicListVariables): MutationRef<CreatePublicListData, CreatePublicListVariables>;
}
export const createPublicListRef: CreatePublicListRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPublicList(dc: DataConnect, vars: CreatePublicListVariables): MutationPromise<CreatePublicListData, CreatePublicListVariables>;

interface CreatePublicListRef {
  ...
  (dc: DataConnect, vars: CreatePublicListVariables): MutationRef<CreatePublicListData, CreatePublicListVariables>;
}
export const createPublicListRef: CreatePublicListRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPublicListRef:
```typescript
const name = createPublicListRef.operationName;
console.log(name);
```

### Variables
The `CreatePublicList` mutation requires an argument of type `CreatePublicListVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePublicListVariables {
  name: string;
  description: string;
}
```
### Return Type
Recall that executing the `CreatePublicList` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePublicListData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePublicListData {
  list_insert: List_Key;
}
```
### Using `CreatePublicList`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPublicList, CreatePublicListVariables } from '@dataconnect/generated';

// The `CreatePublicList` mutation requires an argument of type `CreatePublicListVariables`:
const createPublicListVars: CreatePublicListVariables = {
  name: ..., 
  description: ..., 
};

// Call the `createPublicList()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPublicList(createPublicListVars);
// Variables can be defined inline as well.
const { data } = await createPublicList({ name: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPublicList(dataConnect, createPublicListVars);

console.log(data.list_insert);

// Or, you can use the `Promise` API.
createPublicList(createPublicListVars).then((response) => {
  const data = response.data;
  console.log(data.list_insert);
});
```

### Using `CreatePublicList`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPublicListRef, CreatePublicListVariables } from '@dataconnect/generated';

// The `CreatePublicList` mutation requires an argument of type `CreatePublicListVariables`:
const createPublicListVars: CreatePublicListVariables = {
  name: ..., 
  description: ..., 
};

// Call the `createPublicListRef()` function to get a reference to the mutation.
const ref = createPublicListRef(createPublicListVars);
// Variables can be defined inline as well.
const ref = createPublicListRef({ name: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPublicListRef(dataConnect, createPublicListVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.list_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.list_insert);
});
```

## CreatePrivateList
You can execute the `CreatePrivateList` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createPrivateList(vars: CreatePrivateListVariables): MutationPromise<CreatePrivateListData, CreatePrivateListVariables>;

interface CreatePrivateListRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePrivateListVariables): MutationRef<CreatePrivateListData, CreatePrivateListVariables>;
}
export const createPrivateListRef: CreatePrivateListRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPrivateList(dc: DataConnect, vars: CreatePrivateListVariables): MutationPromise<CreatePrivateListData, CreatePrivateListVariables>;

interface CreatePrivateListRef {
  ...
  (dc: DataConnect, vars: CreatePrivateListVariables): MutationRef<CreatePrivateListData, CreatePrivateListVariables>;
}
export const createPrivateListRef: CreatePrivateListRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPrivateListRef:
```typescript
const name = createPrivateListRef.operationName;
console.log(name);
```

### Variables
The `CreatePrivateList` mutation requires an argument of type `CreatePrivateListVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePrivateListVariables {
  name: string;
  description: string;
}
```
### Return Type
Recall that executing the `CreatePrivateList` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePrivateListData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePrivateListData {
  list_insert: List_Key;
}
```
### Using `CreatePrivateList`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPrivateList, CreatePrivateListVariables } from '@dataconnect/generated';

// The `CreatePrivateList` mutation requires an argument of type `CreatePrivateListVariables`:
const createPrivateListVars: CreatePrivateListVariables = {
  name: ..., 
  description: ..., 
};

// Call the `createPrivateList()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPrivateList(createPrivateListVars);
// Variables can be defined inline as well.
const { data } = await createPrivateList({ name: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPrivateList(dataConnect, createPrivateListVars);

console.log(data.list_insert);

// Or, you can use the `Promise` API.
createPrivateList(createPrivateListVars).then((response) => {
  const data = response.data;
  console.log(data.list_insert);
});
```

### Using `CreatePrivateList`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPrivateListRef, CreatePrivateListVariables } from '@dataconnect/generated';

// The `CreatePrivateList` mutation requires an argument of type `CreatePrivateListVariables`:
const createPrivateListVars: CreatePrivateListVariables = {
  name: ..., 
  description: ..., 
};

// Call the `createPrivateListRef()` function to get a reference to the mutation.
const ref = createPrivateListRef(createPrivateListVars);
// Variables can be defined inline as well.
const ref = createPrivateListRef({ name: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPrivateListRef(dataConnect, createPrivateListVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.list_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.list_insert);
});
```

