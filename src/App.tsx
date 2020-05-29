import * as React from 'react';
import './styles.css';
import { createStore } from 'redux';
import { Provider, useDispatch, useSelector } from 'react-redux';

// ---- Types ----

const TYPE_INCREMENT = 'TYPE_INCREMENT' as const;
const TYPE_REPLACE = 'TYPE_REPLACE' as const;

// ---- Actions ----

const incrementAction = () => ({
  type: TYPE_INCREMENT,
});

const clearAction = () => ({
  type: TYPE_REPLACE,
  payload: {
    count: 0,
  },
});

const replaceAction = (num: number) => ({
  type: TYPE_REPLACE,
  payload: {
    count: num,
  },
});

// ---- Action Types ----

type Actions =
  | ReturnType<typeof incrementAction>
  | ReturnType<typeof clearAction>
  | ReturnType<typeof replaceAction>;

// ---- State ----

type GrobalState = {
  count: number;
};

const initialGrobalState: GrobalState = {
  count: 0,
};

// ---- Reducer ----

const Reducer = (
  state: GrobalState = initialGrobalState,
  action: Actions
): GrobalState => {
  switch (action.type) {
    case TYPE_INCREMENT:
      return { ...state, count: state.count + 1 };
    case TYPE_REPLACE:
      return { ...state, count: action.payload.count };
    default:
  }
  return state;
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
  const count = useSelector((state: GrobalState) => state.count);
  return (
    <>
      <Label count={count} />
      <AddButton />
      <ReplaceButton />
      <ClearButton />
    </>
  );
};

// ---- App ----

const store = createStore(Reducer);

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="App">
        <Counter />
      </div>
    </Provider>
  );
};

export default App;
