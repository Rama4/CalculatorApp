import {ScrollView, SafeAreaView, Pressable, Text, View} from 'react-native';
import ButtonGroup from './components/ButtonGroup';
// import {Feather} from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useState, useCallback, useEffect} from 'react';
import tw from 'twrnc';

const Operators = ['x', '+', '-', '÷'];

export default function App() {
  // stores the typed expression
  const [currExpression, setCurrExpression] = useState('');
  // stores the result value
  const [resultTxt, setResultTxt] = useState('');
  // stores whether or not = sign was pressed
  const [isResultDone, setIsResultDone] = useState(false);

  // whether to show or hide the history
  const [showHistory, setShowHistory] = useState(false);
  // history of expressions
  const [expressionsArr, setExpressionsArr] = useState([]);
  // history of results
  const [resultsArr, setResultsArr] = useState([]);

  // evaluates the expression
  function evaluateExpression(expression) {
    // The expression is evaluated by first creating a new function object using the Function constructor
    // The expression is wrapped in 'return ' and passed as the function body
    // Then the function is invoked and the expression is evaluated
    return new Function(`return ${expression}`)();
  }

  // trims the expression at the end containing any symbols to sanitize it prior to evaluation
  function trimEndWithSymbols(str) {
    let newStr = str?.trim(); // removes beginning and trailing spaces
    while (Operators.includes(newStr?.slice(-1))) {
      // Check last character
      newStr = newStr?.slice(0, -1); // Remove last character if it's an operator
    }
    return newStr;
  }

  // sanitizes the expression prior to evaluation
  function sanitizeExpression(expression) {
    let trimmed_expression = trimEndWithSymbols(expression);
    // replace any operator symbols in the expression with mathematical operators
    trimmed_expression = trimmed_expression
      ?.replace(/X/g, '*')
      ?.replace(/x/g, '*')
      ?.replace(/÷/g, '/')
      ?.replace(/%/g, '*0.01');
    return trimmed_expression;
  }

  const percentageFunction = () => {
    setCurrExpression(exp => exp + '%');
  };
  const deleteFunction = useCallback(() => {
    setCurrExpression(expr => expr.slice(0, -1));
  }, []);

  const changeSignFunction = () => {
    setCurrExpression(sn => (sn.startsWith('-') ? sn.slice(1) : `-${sn}`));
  };

  const handleNumberPress = useCallback(
    value => {
      // if the user presses a number immediately after pressing the = button, then begin a new computation
      if (isResultDone) {
        setCurrExpression(`${value}`);
        setResultTxt(`${value}`);
        setIsResultDone(false); // reset mark result done
        return;
      }
      // otherwise, just append the number to the expression
      setCurrExpression(exp => exp + value);
    },
    [isResultDone],
  );

  const handleOperationPress = op => {
    if (isResultDone) {
      // if the user presses an operator after pressing the = button, then continue with the expression (ex: "5x").
      setIsResultDone(false); // reset mark result done
    }
    // Append the operator to the expression with spaces to improve readability
    setCurrExpression(expr => expr + ' ' + op + ' ');
  };

  const clearScreen = () => {
    // reset the expression and the result
    setCurrExpression('');
    setResultTxt('');
  };

  const onEqualPress = useCallback(() => {
    // add the computation to history
    setExpressionsArr(a => [...a, currExpression]);
    setResultsArr(a => [...a, resultTxt]);
    // mark result as done
    setIsResultDone(true);
  }, [resultTxt, currExpression]);

  useEffect(() => {
    if (isResultDone) {
      setCurrExpression(resultTxt);
    }
  }, [isResultDone, resultTxt]);

  const getFontSize = () => {
    const txt = currExpression;
    const length = txt?.length;
    if (length <= 6) {
      return tw`text-7xl`; // Large font size for up to 6 digits
    } else if (length <= 15) {
      const fontSize = 58 - (length - 6) * 2; // Decrease font size progressively
      return tw`text-[${fontSize}px]`;
    } else {
      return tw`text-3xl`; // Minimum font size for more than 15 digits
    }
  };

  const getFontSize2 = () => {
    const txt = currExpression;
    const length = txt?.length;
    if (length <= 6) {
      return tw`text-6xl`; // Large font size for up to 6 digits
    } else if (length <= 15) {
      const fontSize = 55 - (length - 6) * 2; // Decrease font size progressively
      return tw`text-[${fontSize}px]`;
    } else {
      return tw`text-3xl`; // Minimum font size for more than 15 digits
    }
  };

  // evaluate the expression everytime it changes
  useEffect(() => {
    // sanitize the expression
    const sanitizedText = sanitizeExpression(currExpression);
    const value = evaluateExpression(sanitizedText);

    // set the result
    setResultTxt(value?.toString());
  }, [currExpression, resultTxt, isResultDone, sanitizeExpression]);

  const showOrHideHistory = () => {
    setShowHistory(h => !h);
  };

  const renderResultText = useCallback(() => {
    return (
      <View className="h-auto w-full flex-col justify-evenly mt-10">
        <Text
          style={[
            tw`p-4 text-right mb-10`,
            getFontSize(),
            {fontWeight: 'bold', color: 'white', textAlign: 'right'},
          ]}>
          {currExpression}
        </Text>
        {!isResultDone && (
          <Text
            style={[
              tw`pr-4 text-right`,
              getFontSize2(),
              {color: 'white'},
              {fontWeight: isResultDone ? 'bold' : '100'},
            ]}>
            {resultTxt}
          </Text>
        )}
      </View>
    );
  }, [getFontSize, currExpression, isResultDone, getFontSize2, resultTxt]);

  const renderHistory = () => {
    return (
      <View className="flex-1 w-full flex-col justify-between px-4">
        <Text className="font-bold text-white text-4xl w-full text-right border-b-2 border-gray-500 ">
          History
        </Text>
        <ScrollView showsVerticalScrollIndicator={true}>
          {expressionsArr.map((e, i) => (
            <View
              key={i}
              className="mb-2 ml-4 mr-4 pb-2 border-b border-gray-700">
              <Text className="font-bold text-white text-3xl w-full text-right">
                {e}
              </Text>
              <Text className="text-white text-xl w-full  text-right">
                = {resultsArr[i]}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderButtons = () => {
    return (
      <View className="w-full  py-4 mt-auto border-2 border-gray-500 rounded-lg">
        <View className="flex-row items-center w-full space-x-3 justify-center px-10 mb-2">
          <Pressable
            className="bg-light-gray py-4   rounded-full shadow-md w-1/4"
            onPress={() => clearScreen()}>
            <Text className="text-3xl text-black font-semibold text-center">
              C
            </Text>
          </Pressable>
          <Pressable
            className="bg-light-gray py-4   rounded-full shadow-md w-1/4"
            onPress={() => changeSignFunction()}>
            <Text className="text-3xl text-black font-semibold text-center">
              +/-
            </Text>
          </Pressable>
          <Pressable
            className=" bg-light-gray py-4 rounded-full shadow-md w-1/4"
            onPress={() => percentageFunction()}>
            <Text className="text-3xl text-black font-semibold text-center">
              %
            </Text>
          </Pressable>
          <Pressable
            className="bg-vivid-gamboge py-4   rounded-full shadow-md w-1/4"
            onPress={() => handleOperationPress('÷')}>
            <Text className="text-3xl text-white font-semibold text-center">
              ÷
            </Text>
          </Pressable>
        </View>
        <ButtonGroup
          first="7"
          second="8"
          third="9"
          fourth="x"
          handleNumberPress={handleNumberPress}
          handleOperationPress={handleOperationPress}
        />
        <ButtonGroup
          first="4"
          second="5"
          third="6"
          fourth="-"
          handleNumberPress={handleNumberPress}
          handleOperationPress={handleOperationPress}
        />
        <ButtonGroup
          first="1"
          second="2"
          third="3"
          fourth="+"
          handleNumberPress={handleNumberPress}
          handleOperationPress={handleOperationPress}
        />
        <View className="flex-row items-center w-full space-x-3 justify-center px-10">
          <Pressable
            className="bg-dark-liver py-4   rounded-full shadow-md w-1/4"
            onPress={() => handleNumberPress('.')}>
            <Text className="text-3xl text-white font-semibold text-center">
              .
            </Text>
          </Pressable>
          <Pressable
            className="py-4 bg-dark-liver   rounded-full shadow-md w-1/4"
            onPress={() => handleNumberPress('0')}>
            <Text className="text-3xl text-white font-semibold text-center">
              0
            </Text>
          </Pressable>
          <Pressable
            className="bg-dark-liver py-5 rounded-full items-center justify-center shadow-md w-1/4"
            onPress={() => deleteFunction()}>
            {/* <Feather name="delete" size={24} color="white" /> */}
            <Icon name="backspace" size={20} color="white" />
          </Pressable>
          <Pressable
            className="bg-vivid-gamboge py-4 rounded-full shadow-md w-1/4"
            onPress={onEqualPress}>
            <Text className="text-3xl text-white font-semibold text-center">
              =
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 justify-between bg-white bg-eerie-black items-center border-4 border-gray-500 rounded-xl">
      <Pressable
        className="bg-light-gray p-1 rounded-full shadow-md w-1/4"
        onPress={showOrHideHistory}>
        <Text className="text-md text-black font-semibold text-center">
          {!showHistory ? 'History' : 'Hide'}
        </Text>
      </Pressable>
      {showHistory ? renderHistory() : renderResultText()}
      {renderButtons()}
    </SafeAreaView>
  );
}
