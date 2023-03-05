import { useState } from 'react';
import Test from './Test';
import TestNoArg from './TestNoArg';
import TestJsx from './TestJsx';

function App() {
    const [count, setCount] = useState(0);

    return (
        <div className='App'>
            Tsx Test
            <Test />
            <Test />
            TestWithNoArgs
            <TestNoArg />
            Jsx Test
            <TestJsx />
            <TestJsx />
        </div>
    );
}

export default App;
