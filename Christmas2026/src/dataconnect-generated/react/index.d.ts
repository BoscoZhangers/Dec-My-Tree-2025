import { CreatePublicListData, CreatePublicListVariables, GetPublicListsData, CreatePrivateListData, CreatePrivateListVariables, GetMyPrivateListsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreatePublicList(options?: useDataConnectMutationOptions<CreatePublicListData, FirebaseError, CreatePublicListVariables>): UseDataConnectMutationResult<CreatePublicListData, CreatePublicListVariables>;
export function useCreatePublicList(dc: DataConnect, options?: useDataConnectMutationOptions<CreatePublicListData, FirebaseError, CreatePublicListVariables>): UseDataConnectMutationResult<CreatePublicListData, CreatePublicListVariables>;

export function useGetPublicLists(options?: useDataConnectQueryOptions<GetPublicListsData>): UseDataConnectQueryResult<GetPublicListsData, undefined>;
export function useGetPublicLists(dc: DataConnect, options?: useDataConnectQueryOptions<GetPublicListsData>): UseDataConnectQueryResult<GetPublicListsData, undefined>;

export function useCreatePrivateList(options?: useDataConnectMutationOptions<CreatePrivateListData, FirebaseError, CreatePrivateListVariables>): UseDataConnectMutationResult<CreatePrivateListData, CreatePrivateListVariables>;
export function useCreatePrivateList(dc: DataConnect, options?: useDataConnectMutationOptions<CreatePrivateListData, FirebaseError, CreatePrivateListVariables>): UseDataConnectMutationResult<CreatePrivateListData, CreatePrivateListVariables>;

export function useGetMyPrivateLists(options?: useDataConnectQueryOptions<GetMyPrivateListsData>): UseDataConnectQueryResult<GetMyPrivateListsData, undefined>;
export function useGetMyPrivateLists(dc: DataConnect, options?: useDataConnectQueryOptions<GetMyPrivateListsData>): UseDataConnectQueryResult<GetMyPrivateListsData, undefined>;
