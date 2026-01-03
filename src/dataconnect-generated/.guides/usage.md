# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreatePublicList, useGetPublicLists, useCreatePrivateList, useGetMyPrivateLists } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreatePublicList(createPublicListVars);

const { data, isPending, isSuccess, isError, error } = useGetPublicLists();

const { data, isPending, isSuccess, isError, error } = useCreatePrivateList(createPrivateListVars);

const { data, isPending, isSuccess, isError, error } = useGetMyPrivateLists();

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createPublicList, getPublicLists, createPrivateList, getMyPrivateLists } from '@dataconnect/generated';


// Operation CreatePublicList:  For variables, look at type CreatePublicListVars in ../index.d.ts
const { data } = await CreatePublicList(dataConnect, createPublicListVars);

// Operation GetPublicLists: 
const { data } = await GetPublicLists(dataConnect);

// Operation CreatePrivateList:  For variables, look at type CreatePrivateListVars in ../index.d.ts
const { data } = await CreatePrivateList(dataConnect, createPrivateListVars);

// Operation GetMyPrivateLists: 
const { data } = await GetMyPrivateLists(dataConnect);


```