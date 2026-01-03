import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreatePrivateListData {
  list_insert: List_Key;
}

export interface CreatePrivateListVariables {
  name: string;
  description: string;
}

export interface CreatePublicListData {
  list_insert: List_Key;
}

export interface CreatePublicListVariables {
  name: string;
  description: string;
}

export interface GetMyPrivateListsData {
  lists: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & List_Key)[];
}

export interface GetPublicListsData {
  lists: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & List_Key)[];
}

export interface ListItem_Key {
  listId: UUIDString;
  movieId: UUIDString;
  __typename?: 'ListItem_Key';
}

export interface List_Key {
  id: UUIDString;
  __typename?: 'List_Key';
}

export interface Movie_Key {
  id: UUIDString;
  __typename?: 'Movie_Key';
}

export interface Review_Key {
  id: UUIDString;
  __typename?: 'Review_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface Watch_Key {
  id: UUIDString;
  __typename?: 'Watch_Key';
}

interface CreatePublicListRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePublicListVariables): MutationRef<CreatePublicListData, CreatePublicListVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePublicListVariables): MutationRef<CreatePublicListData, CreatePublicListVariables>;
  operationName: string;
}
export const createPublicListRef: CreatePublicListRef;

export function createPublicList(vars: CreatePublicListVariables): MutationPromise<CreatePublicListData, CreatePublicListVariables>;
export function createPublicList(dc: DataConnect, vars: CreatePublicListVariables): MutationPromise<CreatePublicListData, CreatePublicListVariables>;

interface GetPublicListsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetPublicListsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetPublicListsData, undefined>;
  operationName: string;
}
export const getPublicListsRef: GetPublicListsRef;

export function getPublicLists(): QueryPromise<GetPublicListsData, undefined>;
export function getPublicLists(dc: DataConnect): QueryPromise<GetPublicListsData, undefined>;

interface CreatePrivateListRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePrivateListVariables): MutationRef<CreatePrivateListData, CreatePrivateListVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePrivateListVariables): MutationRef<CreatePrivateListData, CreatePrivateListVariables>;
  operationName: string;
}
export const createPrivateListRef: CreatePrivateListRef;

export function createPrivateList(vars: CreatePrivateListVariables): MutationPromise<CreatePrivateListData, CreatePrivateListVariables>;
export function createPrivateList(dc: DataConnect, vars: CreatePrivateListVariables): MutationPromise<CreatePrivateListData, CreatePrivateListVariables>;

interface GetMyPrivateListsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyPrivateListsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyPrivateListsData, undefined>;
  operationName: string;
}
export const getMyPrivateListsRef: GetMyPrivateListsRef;

export function getMyPrivateLists(): QueryPromise<GetMyPrivateListsData, undefined>;
export function getMyPrivateLists(dc: DataConnect): QueryPromise<GetMyPrivateListsData, undefined>;

