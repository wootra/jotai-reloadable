import { useState } from 'react';
import Test from './Test';
import TestNoArg from './TestNoArg';
import TestJsx from './TestJsx';
import TestNoArgWithRetry from './TestNoArgWithRetry';
import TestNoArgWithRetrySimple from './TestNoArgWithRetrySimple';

function App() {
    const [count, setCount] = useState(0);

    return (
        <div className='App'>
            Tsx Test
            <Test />
            <Test />
            TestWithNoArgs
            <TestNoArg />
            TestWithNoArgWithRetry
            <TestNoArgWithRetry />
            Jsx Test
            <TestJsx />
            <TestJsx />
            TestWithNoArgWithRetrySimple
            <TestNoArgWithRetrySimple />
        </div>
    );
}

export default App;
