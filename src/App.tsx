import * as React from 'react';
import './styles.css';
import {
  Store,
  createStore,
  applyMiddleware,
  MiddlewareAPI,
  Dispatch,
  AnyAction,
} from 'redux';
import { Provider, useDispatch, useSelector } from 'react-redux';

// ---- Types ----

const TYPE_INCREMENT = 'TYPE_INCREMENT' as const;
const TYPE_REPLACE = 'TYPE_REPLACE' as const;
const TYPE_REST_GET_ONE = 'TYPE_REST_GET_ONE' as const;
const TYPE_LOADING = 'TYPE_LOADING' as const;

// ---- Actions ----

const incrementAction = (): AnyAction => ({
  type: TYPE_INCREMENT,
});

const clearAction = (): AnyAction => ({
  type: TYPE_REPLACE,
  payload: {
    count: 0,
  },
});

const replaceAction = (num: number): AnyAction => ({
  type: TYPE_REPLACE,
  payload: {
    count: num,
  },
});

const restGetOneAction = (resources: string, params?: Object): AnyAction => ({
  type: TYPE_REST_GET_ONE,
  payload: {
    resources,
    params: params || undefined,
  },
});

const loadingAction = (loading: boolean) => ({
  type: TYPE_LOADING,
  payload: {
    loading,
  },
});

// ---- Action Types ----

type Actions =
  | ReturnType<typeof incrementAction>
  | ReturnType<typeof clearAction>
  | ReturnType<typeof replaceAction>
  | ReturnType<typeof restGetOneAction>
  | ReturnType<typeof loadingAction>;

// ---- State ----

type GrobalState = {
  view: {
    loading: boolean;
  };
  data: {
    count: number;
  };
};

const initialGrobalState: GrobalState = {
  view: {
    loading: false,
  },
  data: {
    count: 0,
  },
};

// ---- Reducer ----

const Reducer = (
  state: GrobalState = initialGrobalState,
  action: Actions
): GrobalState => {
  console.log('# Reducer', action);
  switch (action.type) {
    case TYPE_INCREMENT:
      return { ...state, data: { count: state.data.count + 1 } };
    case TYPE_REPLACE:
      return { ...state, data: { count: action.payload.count } };
    case TYPE_REST_GET_ONE:
      return { ...state, data: { count: action.payload.count } };
    case TYPE_LOADING:
      return { ...state, view: { loading: action.payload.loading } };
    default:
  }
  return state;
};

// ---- Middleware ----

type Interceptor = {
  type: string;
  handler: (state: GrobalState, action: AnyAction) => Promise<AnyAction>;
};

const createMiddleware = (interceptors: Interceptor[]) => (
  store: MiddlewareAPI
) => (next: Dispatch) => async (action: AnyAction): Promise<void> => {
  console.log('# Middleware');
  const newAction = await new Promise<AnyAction>(async (resolve) => {
    const interceptor = interceptors.find((it) => it.type === action.type);
    resolve(
      interceptor ? await interceptor.handler(store.getState(), action) : action
    );
  });
  next(newAction);
};

// ---- Interceptor ----

const interceptors: Interceptor[] = [
  {
    type: TYPE_REST_GET_ONE,
    handler: async (state: GrobalState, action: AnyAction) => {
      const { resources, params } = action.payload;
      const payload = { count: await fetchGetOneFake(resources, params) };
      return { ...action, payload };
    },
  },
];

// ---- API ----

const fetchGetOneFake = (resources, params) => {
  console.log('# fetchGetOneFake', { resources, params });
  const result = 123456;
  const delay = 3000;
  const delayPromise = async (millis: number) => {
    return new Promise((resolve) => setTimeout(resolve, millis));
  };
  return new Promise(async (resolve) => {
    console.log('- fetch ... wait');
    await delayPromise(delay);
    console.log('- fetch ... resolve');
    resolve(result);
  });
};

// ---- Custom Hooks ----

const useLoading = () => {
  const dispatch = useDispatch();
  const loading: boolean = useSelector(
    (state: GrobalState) => state.view.loading
  );
  return {
    loading,
    setLoading: (value: boolean) => {
      dispatch(loadingAction(value));
    },
  };
};

const useRestApi = () => {
  const { setLoading } = useLoading();
  const dispatch = useDispatch();
  return {
    getOne: (resources: string, params?: Object) => {
      setLoading(true);
      dispatch(restGetOneAction(resources, params)).then(() =>
        setLoading(false)
      );
    },
  };
};

// ---- Counter Component ----

const Label: React.FC<{ count: number }> = React.memo(({ count }) => {
  console.log('## Label');
  return <span>count: {count}</span>;
});

const AddButton: React.FC = React.memo(() => {
  console.log('## AddButton');
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(incrementAction());
  };
  return <button onClick={handleClick}>add</button>;
});

const ReplaceButton: React.FC = React.memo(() => {
  console.log('## ReplaceButton');
  const fixValue = 999;
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(replaceAction(fixValue));
  };
  return <button onClick={handleClick}>set {fixValue}</button>;
});

const ClearButton: React.FC = React.memo(() => {
  console.log('## ClearButton');
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(clearAction());
  };
  return <button onClick={handleClick}>clear</button>;
});

const Counter: React.FC = () => {
  console.log('# Counter');
  const count = useSelector((state: GrobalState) => state.data.count);
  return (
    <>
      <Label count={count} />
      <AddButton />
      <ReplaceButton />
      <ClearButton />
    </>
  );
};

const FetchButton: React.FC = () => {
  console.log('# FetchButton');
  const { getOne } = useRestApi();
  const handleClick = () => {
    getOne('fake', { id: 1 });
  };
  return <button onClick={handleClick}>fetch</button>;
};

const Loading: React.FC = () => {
  return <span>Loading...</span>;
};

const Main: React.FC = () => {
  const { loading } = useLoading();
  return (
    <>
      {!loading ? (
        <>
          <Counter />
          <FetchButton />
        </>
      ) : (
        <Loading />
      )}
    </>
  );
};

// ---- App ----

const store: Store = createStore(
  Reducer,
  applyMiddleware(createMiddleware(interceptors))
);

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="App">
        <Main />
      </div>
    </Provider>
  );
};

export default App;
