import { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const examOptions = {
  CUET: {
    sections: [
      {
        id: 'quantitative-ability',
        name: 'Quantitative Ability',
        chapters: [
          {
            id: 'arithmetic',
            name: 'Arithmetic',
            topics: ['Percentage', 'Ratio', 'Profit and Loss'],
          },
          {
            id: 'algebra',
            name: 'Algebra',
            topics: ['Linear Equations', 'Quadratic Equations', 'Functions'],
          },
        ],
      },
      {
        id: 'logical-reasoning',
        name: 'Logical Reasoning',
        chapters: [
          {
            id: 'series',
            name: 'Series',
            topics: ['Number Series', 'Alphabet Series', 'Coding'],
          },
          {
            id: 'analytical',
            name: 'Analytical',
            topics: ['Blood Relations', 'Directions', 'Syllogism'],
          },
        ],
      },
    ],
  },
  IPMAT: {
    sections: [
      {
        id: 'verbal',
        name: 'Verbal Ability',
        chapters: [
          {
            id: 'grammar',
            name: 'Grammar',
            topics: ['Sentence Correction', 'Reading Skills', 'Vocabulary'],
          },
        ],
      },
      {
        id: 'data',
        name: 'Data Interpretation',
        chapters: [
          {
            id: 'tables',
            name: 'Tables',
            topics: ['Pie Charts', 'Bar Graphs', 'Table Analysis'],
          },
        ],
      },
    ],
  },
  CAT: {
    sections: [
      { id: 'mathematics', name: 'Mathematics', chapters: [{ id: 'chapter-06-1', name: 'Mathematics Foundations', topics: ['Quantitative Practice'] }] },
      { id: 'reading-comprehension', name: 'Reading Comprehension', chapters: [{ id: 'chapter-08-1', name: 'Reading Foundations', topics: ['Reading Practice'] }] },
      { id: 'analytical-reasoning', name: 'Analytical Reasoning', chapters: [{ id: 'chapter-09-1', name: 'Reasoning Foundations', topics: ['Reasoning Practice'] }] },
    ],
  },
};

const generateMockTime = (difficulty) => {
  const baseTime = { Easy: 15, Medium: 25, Hard: 35 };
  const base = baseTime[difficulty] || 20;
  return base + Math.random() * 10 - 5;
};

const questionBank = {
  Percentage: [
    { id: 1, question: 'If 12% of a number is 48, what is the number?', options: ['300', '400', '500', '600'], answer: '400', difficulty: 'Easy', topic: 'Percentage', explanation: 'If 12% = 48, then 100% = (48/12) × 100 = 400. Use the formula: (Part/Percentage) × 100 = Whole' },
    { id: 2, question: 'What is 15% of 240?', options: ['24', '30', '36', '48'], answer: '36', difficulty: 'Easy', topic: 'Percentage', explanation: '15% of 240 = (15/100) × 240 = 0.15 × 240 = 36. Multiply the number by the percentage divided by 100.' },
    { id: 3, question: 'A shop gives a 20% discount on ₹500. What is the discount amount?', options: ['₹50', '₹80', '₹100', '₹120'], answer: '₹100', difficulty: 'Medium', topic: 'Percentage', explanation: 'Discount = 20% of 500 = (20/100) × 500 = ₹100. Discount always reduces the price.' },
    { id: 4, question: 'A student scored 80 out of 100 in Maths. What is the percentage?', options: ['70%', '80%', '85%', '90%'], answer: '80%', difficulty: 'Easy', topic: 'Percentage', explanation: 'Percentage = (Obtained/Total) × 100 = (80/100) × 100 = 80%' },
    { id: 5, question: 'If the price increases by 25% from ₹80, what is the new price?', options: ['₹90', '₹95', '₹100', '₹105'], answer: '₹100', difficulty: 'Medium', topic: 'Percentage', explanation: 'New Price = Original + Increase = 80 + (25% of 80) = 80 + 20 = ₹100' },
  ],
  Ratio: [
    { id: 6, question: 'The ratio of boys to girls is 3:5. If there are 24 boys, how many girls?', options: ['32', '36', '40', '48'], answer: '40', difficulty: 'Medium', topic: 'Ratio', explanation: 'If 3 parts = 24, then 1 part = 8. So 5 parts = 40. Use ratio multiplication to find the missing value.' },
    { id: 7, question: 'Simplify the ratio 18:24.', options: ['3:4', '4:5', '2:3', '5:6'], answer: '3:4', difficulty: 'Easy', topic: 'Ratio', explanation: 'Find GCD(18, 24) = 6. Divide both: 18÷6 = 3, 24÷6 = 4. Simplified ratio = 3:4' },
    { id: 8, question: 'If a:b = 2:3 and b:c = 3:5, then a:c = ?', options: ['2:5', '3:5', '2:3', '5:2'], answer: '2:5', difficulty: 'Medium', topic: 'Ratio', explanation: 'When b is common: a:b = 2:3 and b:c = 3:5, then a:c = 2:5. Direct substitution method.' },
    { id: 9, question: 'Divide ₹600 in the ratio 1:2:3.', options: ['₹100, ₹200, ₹300', '₹150, ₹250, ₹200', '₹120, ₹200, ₹280', '₹90, ₹180, ₹330'], answer: '₹100, ₹200, ₹300', difficulty: 'Easy', topic: 'Ratio', explanation: 'Total parts = 1+2+3 = 6. Each part = 600/6 = 100. So: 1×100=100, 2×100=200, 3×100=300' },
    { id: 10, question: 'The ratio of ages of A and B is 4:7. If B is 21, what is A?', options: ['10', '12', '14', '16'], answer: '12', difficulty: 'Medium', topic: 'Ratio', explanation: 'If 7 parts = 21, then 1 part = 3. So 4 parts = 12. A is 12 years old.' },
  ],
  'Profit and Loss': [
    { id: 11, question: 'A product costs ₹200 and is sold for ₹240. What is the profit?', options: ['₹20', '₹30', '₹40', '₹50'], answer: '₹40', difficulty: 'Easy', topic: 'Profit and Loss', explanation: 'Profit = SP - CP = 240 - 200 = ₹40. Profit occurs when Selling Price > Cost Price.' },
    { id: 12, question: 'If CP = ₹500 and SP = ₹425, what is the loss percent?', options: ['10%', '12%', '15%', '20%'], answer: '15%', difficulty: 'Medium', topic: 'Profit and Loss', explanation: 'Loss = 500 - 425 = ₹75. Loss% = (75/500)×100 = 15%. Loss occurs when SP < CP.' },
    { id: 13, question: 'A trader marks an item 25% above cost price and sells at 10% discount. What is the net profit?', options: ['15%', '12.5%', '10%', '8%'], answer: '12.5%', difficulty: 'Hard', topic: 'Profit and Loss', explanation: 'MP = CP×1.25. SP = MP×0.9 = CP×1.25×0.9 = CP×1.125. Profit% = 12.5%' },
    { id: 14, question: 'If loss is 20% on cost price, what is the selling price for a product costing ₹250?', options: ['₹200', '₹210', '₹220', '₹230'], answer: '₹200', difficulty: 'Medium', topic: 'Profit and Loss', explanation: 'SP = CP - Loss = CP - (20% of CP) = 250 - 50 = ₹200' },
    { id: 15, question: 'A shopkeeper buys an item for ₹300 and sells it for ₹360. Profit percent is:', options: ['15%', '20%', '25%', '30%'], answer: '20%', difficulty: 'Easy', topic: 'Profit and Loss', explanation: 'Profit = 360 - 300 = ₹60. Profit% = (60/300)×100 = 20%' },
  ],
  'Linear Equations': [
    { id: 16, question: 'Solve: x + 8 = 15', options: ['5', '6', '7', '8'], answer: '7', difficulty: 'Easy', topic: 'Linear Equations', explanation: 'Move 8 to the right side: x = 15 - 8 = 7. Check: 7 + 8 = 15 ✓' },
    { id: 17, question: 'Solve: 2x - 3 = 9', options: ['4', '5', '6', '7'], answer: '6', difficulty: 'Medium', topic: 'Linear Equations', explanation: 'Move -3 to right: 2x = 12. Divide by 2: x = 6. Check: 2(6) - 3 = 9 ✓' },
    { id: 18, question: 'If 3x + 5 = 20, then x = ?', options: ['3', '4', '5', '6'], answer: '5', difficulty: 'Easy', topic: 'Linear Equations', explanation: '3x = 20 - 5 = 15. x = 15 ÷ 3 = 5' },
    { id: 19, question: 'Solve: 5x = 35', options: ['5', '6', '7', '8'], answer: '7', difficulty: 'Easy', topic: 'Linear Equations', explanation: 'Divide both sides by 5: x = 35 ÷ 5 = 7' },
    { id: 20, question: 'If x/4 = 3, then x = ?', options: ['8', '10', '12', '14'], answer: '12', difficulty: 'Medium', topic: 'Linear Equations', explanation: 'Multiply both sides by 4: x = 3 × 4 = 12' },
  ],
  'Quadratic Equations': [
    { id: 21, question: 'Factor: x² - 9', options: ['(x-3)(x+3)', '(x-9)(x+1)', '(x-9)(x+9)', '(x-3)(x-3)'], answer: '(x-3)(x+3)', difficulty: 'Hard', topic: 'Quadratic Equations' },
    { id: 22, question: 'Solve: x² - 5x + 6 = 0', options: ['x=2,3', 'x=1,6', 'x=3,4', 'x=2,5'], answer: 'x=2,3', difficulty: 'Medium', topic: 'Quadratic Equations' },
    { id: 23, question: 'The roots of x² - 7x + 12 = 0 are:', options: ['2 and 6', '3 and 4', '1 and 12', '2 and 5'], answer: '3 and 4', difficulty: 'Medium', topic: 'Quadratic Equations' },
    { id: 24, question: 'The value of discriminant for x² - 4x + 4 is:', options: ['0', '4', '8', '16'], answer: '0', difficulty: 'Easy', topic: 'Quadratic Equations' },
    { id: 25, question: 'x² - 9x + 20 = 0 has roots:', options: ['4 and 5', '2 and 10', '1 and 20', '3 and 7'], answer: '4 and 5', difficulty: 'Medium', topic: 'Quadratic Equations' },
  ],
  Functions: [
    { id: 26, question: 'If f(x) = 2x + 3, then f(4) = ?', options: ['7', '9', '11', '13'], answer: '11', difficulty: 'Easy', topic: 'Functions' },
    { id: 27, question: 'If f(x) = x² + 1, then f(3) = ?', options: ['7', '9', '10', '12'], answer: '10', difficulty: 'Easy', topic: 'Functions' },
    { id: 28, question: 'If g(x) = 3x - 2 and g(5) = ?', options: ['10', '11', '12', '13'], answer: '13', difficulty: 'Medium', topic: 'Functions' },
    { id: 29, question: 'Which of these is a linear function?', options: ['x² + 1', '2x + 3', 'x³', 'sin x'], answer: '2x + 3', difficulty: 'Easy', topic: 'Functions' },
    { id: 30, question: 'If f(x) = x + 5, find f(0).', options: ['0', '4', '5', '6'], answer: '5', difficulty: 'Easy', topic: 'Functions' },
  ],
  'Number Series': [
    { id: 31, question: 'Find the next number: 2, 6, 12, 20, 30, ?', options: ['36', '40', '42', '48'], answer: '42', difficulty: 'Medium', topic: 'Number Series' },
    { id: 32, question: 'Find the next number: 4, 9, 16, 25, ?', options: ['30', '36', '49', '64'], answer: '36', difficulty: 'Easy', topic: 'Number Series' },
    { id: 33, question: 'Complete the series: 3, 6, 12, 24, ?', options: ['30', '36', '48', '60'], answer: '48', difficulty: 'Medium', topic: 'Number Series' },
    { id: 34, question: 'Find the wrong term: 2, 4, 8, 16, 20', options: ['2', '8', '16', '20'], answer: '20', difficulty: 'Easy', topic: 'Number Series' },
    { id: 35, question: 'Next term of 1, 4, 9, 16, 25, ?', options: ['30', '36', '49', '64'], answer: '36', difficulty: 'Medium', topic: 'Number Series' },
  ],
  'Alphabet Series': [
    { id: 36, question: 'Complete the series: A, C, E, G, ?', options: ['H', 'I', 'J', 'K'], answer: 'I', difficulty: 'Easy', topic: 'Alphabet Series' },
    { id: 37, question: 'Find the next letter: B, D, F, H, ?', options: ['I', 'J', 'K', 'L'], answer: 'J', difficulty: 'Medium', topic: 'Alphabet Series' },
    { id: 38, question: 'Complete: Z, X, V, T, ?', options: ['R', 'S', 'Q', 'P'], answer: 'R', difficulty: 'Easy', topic: 'Alphabet Series' },
    { id: 39, question: 'Which comes next: M, O, Q, S, ?', options: ['U', 'T', 'V', 'W'], answer: 'U', difficulty: 'Medium', topic: 'Alphabet Series' },
    { id: 40, question: 'Find the next letter: A, B, D, G, K, ?', options: ['L', 'M', 'N', 'P'], answer: 'P', difficulty: 'Hard', topic: 'Alphabet Series' },
  ],
  Coding: [
    { id: 41, question: 'If M = 13, then A = ?', options: ['1', '2', '3', '4'], answer: '1', difficulty: 'Easy', topic: 'Coding' },
    { id: 42, question: 'If C = 3 and D = 4, then B = ?', options: ['1', '2', '3', '4'], answer: '2', difficulty: 'Easy', topic: 'Coding' },
    { id: 43, question: 'In a code, CAT = 24. What is BAT?', options: ['23', '24', '25', '26'], answer: '24', difficulty: 'Medium', topic: 'Coding' },
    { id: 44, question: 'If A = 1, B = 2, C = 3, then C + A = ?', options: ['3', '4', '5', '6'], answer: '4', difficulty: 'Easy', topic: 'Coding' },
    { id: 45, question: 'If B = 2 and D = 4, what is B + D?', options: ['4', '5', '6', '7'], answer: '6', difficulty: 'Easy', topic: 'Coding' },
  ],
  'Blood Relations': [
    { id: 46, question: 'A is B\'s father. B is C\'s son. How is A related to C?', options: ['Brother', 'Father', 'Grandfather', 'Uncle'], answer: 'Grandfather', difficulty: 'Medium', topic: 'Blood Relations' },
    { id: 47, question: 'P is Q\'s sister. Q is R\'s daughter. How is P related to R?', options: ['Mother', 'Granddaughter', 'Daughter', 'Sister'], answer: 'Granddaughter', difficulty: 'Medium', topic: 'Blood Relations' },
    { id: 48, question: 'A is the son of B and B is the son of C. How is C related to A?', options: ['Father', 'Grandfather', 'Brother', 'Uncle'], answer: 'Grandfather', difficulty: 'Easy', topic: 'Blood Relations' },
    { id: 49, question: 'If X is the brother of Y and Y is the mother of Z, then X is Z\'s:', options: ['Father', 'Brother', 'Uncle', 'Grandfather'], answer: 'Uncle', difficulty: 'Medium', topic: 'Blood Relations' },
    { id: 50, question: 'M is the brother of N and O is the mother of M. How is O related to N?', options: ['Daughter', 'Sister', 'Mother', 'Aunt'], answer: 'Mother', difficulty: 'Easy', topic: 'Blood Relations' },
  ],
  Directions: [
    { id: 51, question: 'A person walks 5 km north and then 3 km east. In which direction is he from the starting point?', options: ['North-East', 'South-East', 'North-West', 'South-West'], answer: 'North-East', difficulty: 'Medium', topic: 'Directions' },
    { id: 52, question: 'If South is behind you and East is to your right, what direction is in front?', options: ['North', 'South', 'East', 'West'], answer: 'North', difficulty: 'Easy', topic: 'Directions' },
    { id: 53, question: 'A person moves left from East. Which direction is he facing?', options: ['North', 'South', 'West', 'East'], answer: 'North', difficulty: 'Medium', topic: 'Directions' },
    { id: 54, question: 'If you are facing West and turn 90° left, which direction do you face?', options: ['North', 'South', 'East', 'West'], answer: 'South', difficulty: 'Easy', topic: 'Directions' },
    { id: 55, question: 'North is opposite to:', options: ['East', 'West', 'South', 'North-East'], answer: 'South', difficulty: 'Easy', topic: 'Directions' },
  ],
  Syllogism: [
    { id: 56, question: 'All dogs are mammals. All mammals are animals. Therefore, all dogs are:', options: ['Mammals', 'Animals', 'Pets', 'Birds'], answer: 'Animals', difficulty: 'Easy', topic: 'Syllogism' },
    { id: 57, question: 'All roses are flowers. Some flowers are red. Therefore:', options: ['All roses are red', 'Some roses are red', 'No rose is red', 'All flowers are roses'], answer: 'Some roses are red', difficulty: 'Hard', topic: 'Syllogism' },
    { id: 58, question: 'No student is lazy. Some lazy people are workers. Therefore:', options: ['Some workers are students', 'No worker is student', 'Some students are workers', 'No conclusion'], answer: 'No conclusion', difficulty: 'Hard', topic: 'Syllogism' },
    { id: 59, question: 'All pens are blue. Some blue objects are books. Therefore:', options: ['All books are pens', 'Some books are pens', 'No conclusion', 'All pens are books'], answer: 'No conclusion', difficulty: 'Medium', topic: 'Syllogism' },
    { id: 60, question: 'Some cats are black. All black things are animals. Therefore:', options: ['All animals are cats', 'Some cats are animals', 'All cats are animals', 'No conclusion'], answer: 'Some cats are animals', difficulty: 'Medium', topic: 'Syllogism' },
  ],
  'Sentence Correction': [
    { id: 61, question: 'Choose the correct sentence:', options: ['He do not know the answer', 'He does not know the answer', 'He does not knows the answer', 'He not know the answer'], answer: 'He does not know the answer', difficulty: 'Easy', topic: 'Sentence Correction' },
    { id: 62, question: 'Choose the correct sentence:', options: ['She have finished her work', 'She has finished her work', 'She have finish her work', 'She are finished her work'], answer: 'She has finished her work', difficulty: 'Easy', topic: 'Sentence Correction' },
    { id: 63, question: 'Choose the correct sentence:', options: ['I am agree with you', 'I agree with you', 'I agreeing with you', 'I am agreed with you'], answer: 'I agree with you', difficulty: 'Medium', topic: 'Sentence Correction' },
    { id: 64, question: 'Choose the correct sentence:', options: ['He is more smarter than me', 'He is smarter than me', 'He is smart than me', 'He is smart as me'], answer: 'He is smarter than me', difficulty: 'Medium', topic: 'Sentence Correction' },
    { id: 65, question: 'Choose the correct sentence:', options: ['The weather were bad', 'The weather was bad', 'The weather are bad', 'The weather be bad'], answer: 'The weather was bad', difficulty: 'Easy', topic: 'Sentence Correction' },
  ],
  'Reading Skills': [
    { id: 66, question: 'A passage mainly tells us the:', options: ['Author\'s name', 'Main idea', 'Word count', 'School details'], answer: 'Main idea', difficulty: 'Easy', topic: 'Reading Skills' },
    { id: 67, question: 'Which is a supporting detail?', options: ['The main argument of the passage', 'A fact that backs the main idea', 'The title only', 'The author\'s age'], answer: 'A fact that backs the main idea', difficulty: 'Medium', topic: 'Reading Skills' },
    { id: 68, question: 'What does inference mean?', options: ['Guessing by evidence', 'Copying the passage', 'Ignoring the passage', 'Reading only the title'], answer: 'Guessing by evidence', difficulty: 'Medium', topic: 'Reading Skills' },
    { id: 69, question: 'A good summary should be:', options: ['Very long', 'Short and accurate', 'Repeated', 'Full of opinions'], answer: 'Short and accurate', difficulty: 'Easy', topic: 'Reading Skills' },
    { id: 70, question: 'A passage about climate change is likely about:', options: ['The weather system', 'The effect of climate on living conditions', 'A sports event', 'A cooking recipe'], answer: 'The effect of climate on living conditions', difficulty: 'Medium', topic: 'Reading Skills' },
  ],
  Vocabulary: [
    { id: 71, question: 'Choose the synonym of “Brisk”.', options: ['Slow', 'Quick', 'Lazy', 'Heavy'], answer: 'Quick', difficulty: 'Easy', topic: 'Vocabulary' },
    { id: 72, question: 'Choose the antonym of “Visible”.', options: ['Clear', 'Invisible', 'Bright', 'Open'], answer: 'Invisible', difficulty: 'Easy', topic: 'Vocabulary' },
    { id: 73, question: 'What does “Benevolent” mean?', options: ['Cruel', 'Kind', 'Silent', 'Angry'], answer: 'Kind', difficulty: 'Medium', topic: 'Vocabulary' },
    { id: 74, question: 'Choose the synonym of “Diligent”.', options: ['Careless', 'Careful', 'Lazy', 'Noisy'], answer: 'Careful', difficulty: 'Easy', topic: 'Vocabulary' },
    { id: 75, question: 'The word “Fragile” means:', options: ['Strong', 'Delicate', 'Modern', 'Large'], answer: 'Delicate', difficulty: 'Medium', topic: 'Vocabulary' },
  ],
  'Pie Charts': [
    { id: 76, question: 'A pie chart shows 25% in one segment. What fraction is that?', options: ['1/4', '1/3', '1/2', '2/3'], answer: '1/4', difficulty: 'Easy', topic: 'Pie Charts' },
    { id: 77, question: 'If one sector is 50% of a chart, what angle does it take?', options: ['90°', '120°', '150°', '180°'], answer: '180°', difficulty: 'Medium', topic: 'Pie Charts' },
    { id: 78, question: 'A chart shows 20% for food. If total is 500, what is the value?', options: ['50', '75', '100', '125'], answer: '100', difficulty: 'Easy', topic: 'Pie Charts' },
    { id: 79, question: 'A pie chart on expenses has 30% rent. What is the remaining percentage?', options: ['60%', '70%', '75%', '80%'], answer: '70%', difficulty: 'Medium', topic: 'Pie Charts' },
    { id: 80, question: 'If 40% of a total is 200, what is the full total?', options: ['300', '400', '500', '600'], answer: '500', difficulty: 'Medium', topic: 'Pie Charts' },
  ],
  'Bar Graphs': [
    { id: 81, question: 'A bar graph shows a value of 40 for A and 20 for B. How many times is A greater than B?', options: ['1x', '2x', '3x', '4x'], answer: '2x', difficulty: 'Easy', topic: 'Bar Graphs' },
    { id: 82, question: 'Highest bar in a graph indicates:', options: ['Lowest value', 'Average value', 'Maximum value', 'Median value'], answer: 'Maximum value', difficulty: 'Easy', topic: 'Bar Graphs' },
    { id: 83, question: 'If one bar is 30 and another is 60, then second is ____ times the first.', options: ['1x', '2x', '3x', '4x'], answer: '2x', difficulty: 'Medium', topic: 'Bar Graphs' },
    { id: 84, question: 'Bar graphs are best for:', options: ['Showing parts of a whole', 'Comparing values', 'Writing essays', 'Making equations'], answer: 'Comparing values', difficulty: 'Easy', topic: 'Bar Graphs' },
    { id: 85, question: 'If the graph values are 10, 20, 30, total is 60. What is average?', options: ['20', '30', '40', '60'], answer: '20', difficulty: 'Medium', topic: 'Bar Graphs' },
  ],
  'Table Analysis': [
    { id: 86, question: 'If Table values are 10, 20, 30, what is the sum?', options: ['50', '60', '70', '80'], answer: '60', difficulty: 'Easy', topic: 'Table Analysis' },
    { id: 87, question: 'The mean of 5, 10, 15 is:', options: ['5', '10', '15', '20'], answer: '10', difficulty: 'Easy', topic: 'Table Analysis' },
    { id: 88, question: 'If 20% of total is 40, full total is:', options: ['160', '180', '200', '220'], answer: '200', difficulty: 'Medium', topic: 'Table Analysis' },
    { id: 89, question: 'The median of 7, 9, 11, 13, 15 is:', options: ['9', '11', '13', '15'], answer: '11', difficulty: 'Easy', topic: 'Table Analysis' },
    { id: 90, question: 'A table shows 30, 40, 50. What is the total?', options: ['100', '110', '120', '130'], answer: '120', difficulty: 'Easy', topic: 'Table Analysis' },
  ],
};

const initialAttempts = [
  {
    id: 1,
    label: 'Practice 1',
    createdOn: '2026-06-29',
    sectionName: 'Quantitative Ability',
    totalQuestions: 10,
  },
  {
    id: 2,
    label: 'Practice 2',
    createdOn: '2026-06-25',
    sectionName: 'Logical Reasoning',
    totalQuestions: 12,
  },
  {
    id: 3,
    label: 'Practice 3',
    createdOn: '2026-06-18',
    sectionName: 'Verbal Ability',
    totalQuestions: 8,
  },
];

const formatDate = (dateValue) => {
  const date = new Date(dateValue);
  return `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const getQuestionsForTopic = (topicName, questionLimit = 10) => {
  const pool = questionBank[topicName] || questionBank.Percentage;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(questionLimit, shuffled.length));
};

const buildPracticeResult = (answers) => {
  // Build timing data based on difficulty (mock data if not provided)
  const timings = answers.map((answer, idx) => {
    const baseDuration = answer.difficulty === 'Easy' ? 10 : answer.difficulty === 'Medium' ? 20 : 30;
    const randomFactor = Math.random() * 10 - 5;
    return {
      questionId: answer.questionId,
      duration: Math.max(3, baseDuration + randomFactor),
      shownTime: new Date(Date.now() - (answers.length - idx) * 20000).toISOString(),
      submittedTime: new Date(Date.now() - (answers.length - idx - 1) * 20000).toISOString(),
    };
  });

  const summary = {
    total: answers.length,
    attempted: answers.filter((answer) => answer.selected !== null).length,
    correct: answers.filter((answer) => answer.selected === answer.correct).length,
    incorrect: answers.filter((answer) => answer.selected !== null && answer.selected !== answer.correct).length,
    skipped: answers.filter((answer) => answer.selected === null).length,
  };

  summary.accuracy = summary.attempted > 0 ? Math.round((summary.correct / summary.attempted) * 100) : 0;

  // Calculate time metrics
  const totalDuration = timings.reduce((sum, t) => sum + t.duration, 0);
  const avgDuration = totalDuration / timings.length;

  const difficultyBreakdown = {
    Easy: { questions: 0, correct: 0, incorrect: 0, skipped: 0 },
    Medium: { questions: 0, correct: 0, incorrect: 0, skipped: 0 },
    Hard: { questions: 0, correct: 0, incorrect: 0, skipped: 0 },
  };

  answers.forEach((answer) => {
    const bucket = difficultyBreakdown[answer.difficulty] || difficultyBreakdown.Easy;
    bucket.questions += 1;
    if (answer.selected === null) bucket.skipped += 1;
    else if (answer.selected === answer.correct) bucket.correct += 1;
    else bucket.incorrect += 1;
  });

  // Return local result object
  return {
    summary,
    difficultyBreakdown,
    avgResponseTime: avgDuration.toFixed(2),
    totalTime: totalDuration.toFixed(2),
    weakTopics: [
      {
        topic: 'Practice Focus',
        priority: 'High',
        reason: 'Targeted revision will improve consistency in the selected topic.',
        action: 'Review the concept notes and solve a short mixed set again.',
      },
    ],
    backendData: null
  };
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: 'user-001', password: 'demo123' });
  const [selectedExam, setSelectedExam] = useState('CUET');
  const [selectedSection, setSelectedSection] = useState('quantitative-ability');
  const [selectedChapter, setSelectedChapter] = useState('arithmetic');
  const [selectedTopic, setSelectedTopic] = useState('Percentage');
  const [questionCount, setQuestionCount] = useState('10');
  const [attempts, setAttempts] = useState(initialAttempts);
  const [selectedAttemptId, setSelectedAttemptId] = useState(1);
  const [screen, setScreen] = useState('dashboard');
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [practiceAnswers, setPracticeAnswers] = useState([]);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);
  const [practiceResult, setPracticeResult] = useState(null);
  const [reportTab, setReportTab] = useState('analysis');
  const [solutionIndex, setSolutionIndex] = useState(0);
  const [currentQuestionTimer, setCurrentQuestionTimer] = useState(0);
  const [quizId, setQuizId] = useState(null);
  const [apiError, setApiError] = useState('');

  const examData = examOptions[selectedExam];
  const currentSection = examData.sections.find((section) => section.id === selectedSection) || examData.sections[0];
  const currentChapter = currentSection.chapters.find((chapter) => chapter.id === selectedChapter) || currentSection.chapters[0];
  const topicOptions = currentChapter.topics;

  const currentQuestion = practiceQuestions[currentPracticeIndex] || null;
  const attemptedCount = practiceAnswers.filter((answer) => answer.selected !== null).length;

  const handleLogin = (event) => {
    event.preventDefault();
    setIsLoggedIn(true);
  };

  const handleExamChange = (value) => {
    const next = examOptions[value];
    const nextSection = next.sections[0];
    const nextChapter = nextSection.chapters[0];
    setSelectedExam(value);
    setSelectedSection(nextSection.id);
    setSelectedChapter(nextChapter.id);
    setSelectedTopic(nextChapter.topics[0]);
  };

  const handleSectionChange = (value) => {
    const nextSection = examOptions[selectedExam].sections.find((section) => section.id === value) || examOptions[selectedExam].sections[0];
    const nextChapter = nextSection.chapters[0];
    setSelectedSection(value);
    setSelectedChapter(nextChapter.id);
    setSelectedTopic(nextChapter.topics[0]);
  };

  const handleChapterChange = (value) => {
    const nextChapter = currentSection.chapters.find((chapter) => chapter.id === value) || currentSection.chapters[0];
    setSelectedChapter(value);
    setSelectedTopic(nextChapter.topics[0]);
  };

  const handleStartPractice = async () => {
    const selectedCount = Number(questionCount) || 10;
    setApiError('');
    let questions;
    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loginForm.email, examId: selectedExam.toLowerCase(), subjectId: selectedSection, chapterId: selectedChapter, questionCount: selectedCount }),
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Unable to start quiz');
      const body = await response.json();
      setQuizId(body.data.quizId);
      questions = body.data.questions.map((question) => ({ id: question.questionId, question: question.text, options: question.options, difficulty: question.difficulty, topic: selectedTopic }));
    } catch (error) {
      setApiError(error.message);
      return;
    }
    const answers = questions.map((question) => ({
      questionId: question.id,
      selected: null,
      correct: question.answer,
      difficulty: question.difficulty,
      topic: question.topic,
    }));

    const newAttempt = {
      id: Date.now(),
      label: `Practice ${attempts.length + 1}`,
      createdOn: new Date().toISOString(),
      sectionName: currentSection.name,
      totalQuestions: questions.length,
      questions,
      answers,
      result: null,
    };

    setAttempts((prev) => [newAttempt, ...prev]);
    setSelectedAttemptId(newAttempt.id);
    setPracticeSubmitted(false);
    setPracticeQuestions(questions);
    setPracticeAnswers(answers);
    setCurrentPracticeIndex(0);
    setCurrentQuestionTimer(0);
    setPracticeResult(null);
    setScreen('practice');
  };

  const handleAnswerSelect = (selectedOption) => {
    setPracticeAnswers((prev) =>
      prev.map((entry, index) =>
        index === currentPracticeIndex ? { ...entry, selected: selectedOption } : entry,
      ),
    );
  };

  const handleNext = () => {
    if (currentPracticeIndex < practiceQuestions.length - 1) {
      setPracticeAnswers((prev) => prev.map((entry, index) => index === currentPracticeIndex ? { ...entry, duration: currentQuestionTimer } : entry));
      setCurrentPracticeIndex((prev) => prev + 1);
      setCurrentQuestionTimer(0);
    }
  };

  const handleSubmitPractice = async () => {
    const finalAnswers = practiceAnswers.map((entry, index) => index === currentPracticeIndex ? { ...entry, duration: currentQuestionTimer } : entry);
    const result = buildPracticeResult(finalAnswers);
    const currentAttemptId = selectedAttemptId || Date.now();

    const payload = {
      examId: selectedExam,
      topicId: selectedTopic,
      userId: loginForm.email || 'demo-user',
      subjectId: selectedSection,
      chapterId: selectedChapter,
      answers: finalAnswers.map((answer) => ({ questionId: answer.questionId, selected: answer.selected, duration: answer.duration || 0 })),
    };

    let savedAttempt = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}/batch-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const savedResult = data?.data?.result || result;
        const backendQuestions = data?.data?.questions?.map((question) => ({ id: question.questionId, question: question.text, options: question.options, answer: question.options[question.correctOption], difficulty: question.difficulty, topic: selectedTopic, explanation: question.explanation }));
        const backendAnswers = data?.data?.questions?.map((question) => ({ questionId: question.questionId, selected: question.options[question.selectedOption], correct: question.options[question.correctOption], difficulty: question.difficulty, topic: selectedTopic, duration: question.responseDuration }));
        savedAttempt = {
          id: currentAttemptId,
          label: `Practice ${attempts.length + 1}`,
          createdOn: new Date().toISOString(),
          sectionName: currentSection.name,
          totalQuestions: practiceQuestions.length,
          questions: backendQuestions || practiceQuestions,
          answers: backendAnswers || finalAnswers,
          result: savedResult,
        };

        setAttempts((prev) => {
          const existing = prev.some((attempt) => attempt.id === currentAttemptId);
          if (existing) {
            return prev.map((attempt) =>
              attempt.id === currentAttemptId ? { ...attempt, ...savedAttempt, result: savedResult } : attempt,
            );
          }
          return [savedAttempt, ...prev];
        });
        setSelectedAttemptId(currentAttemptId);
        setPracticeResult(savedResult);
      } else {
        setPracticeResult(result);
      }
    } catch {
      setPracticeResult(result);
    }

    if (!savedAttempt) {
      savedAttempt = {
        id: currentAttemptId,
        label: `Practice ${attempts.length + 1}`,
        createdOn: new Date().toISOString(),
        sectionName: currentSection.name,
        totalQuestions: practiceQuestions.length,
        questions: practiceQuestions,
        answers: practiceAnswers,
        result,
      };
      setAttempts((prev) => {
        const existing = prev.some((attempt) => attempt.id === currentAttemptId);
        if (existing) {
          return prev.map((attempt) =>
            attempt.id === currentAttemptId ? { ...attempt, ...savedAttempt, result } : attempt,
          );
        }
        return [savedAttempt, ...prev];
      });
      setSelectedAttemptId(currentAttemptId);
    }

    setPracticeSubmitted(true);
  };

  const handleBackToDashboard = () => {
    setPracticeQuestions([]);
    setPracticeAnswers([]);
    setCurrentPracticeIndex(0);
    setPracticeSubmitted(false);
    setPracticeResult(null);
    setScreen('dashboard');
  };

  // Timer effect for practice questions
  useEffect(() => {
    if (!practiceSubmitted && currentQuestion) {
      const interval = setInterval(() => {
        setCurrentQuestionTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [practiceSubmitted, currentQuestion]);

  const openReportPage = (attempt) => {
    const actualQuestions = attempt.questions || getQuestionsForTopic(selectedTopic, attempt.totalQuestions || 10);
    const actualAnswers = attempt.answers || actualQuestions.map((question) => ({
      questionId: question.id,
      selected: Math.random() > 0.5 ? question.answer : question.options[0],
      correct: question.answer,
      difficulty: question.difficulty,
      topic: question.topic,
    }));
    const reportResult = attempt.result || buildPracticeResult(actualAnswers);

    setSelectedAttemptId(attempt.id);
    setPracticeQuestions(actualQuestions);
    setPracticeAnswers(actualAnswers);
    setPracticeResult(reportResult);
    setPracticeSubmitted(true);
    setScreen('report');
  };

  const renderDashboard = () => (
    <div className="practice-shell">
      <div className="dashboard-layout">
        <aside className="report-panel">
          <h2>Practice Report</h2>

          <div className="filter-block">
            <span className="filter-title">Filter</span>
            <ul>
              <li className="active">Recent</li>
              <li>Past 7 days</li>
              <li>Past 30 days</li>
            </ul>
          </div>

          <div className="attempt-list">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className={selectedAttemptId === attempt.id ? 'attempt-item selected' : 'attempt-item'}
                onClick={() => setSelectedAttemptId(attempt.id)}
              >
                <div className="attempt-header">
                  <strong>{attempt.label}</strong>
                  <span>({formatDate(attempt.createdOn)})</span>
                </div>

                <div className="attempt-meta-row">
                  <span>Section: {attempt.sectionName}</span>
                  <span>No. of questions: {attempt.totalQuestions}</span>
                </div>

                <button className="report-button" type="button" onClick={(event) => {
                  event.stopPropagation();
                  openReportPage(attempt);
                }}>
                  Report
                </button>
              </div>
            ))}
          </div>
        </aside>

        <section className="new-practice-panel">
          <h2>New Practice</h2>

          <div className="form-grid">
            <div className="field-row">
              <label>Exam</label>
              <select value={selectedExam} onChange={(event) => handleExamChange(event.target.value)}>
                {Object.keys(examOptions).map((exam) => (
                  <option key={exam} value={exam}>{exam}</option>
                ))}
              </select>
            </div>

            <div className="field-row">
              <label>Section</label>
              <select value={selectedSection} onChange={(event) => handleSectionChange(event.target.value)}>
                {examData.sections.map((section) => (
                  <option key={section.id} value={section.id}>{section.name}</option>
                ))}
              </select>
            </div>

            <div className="field-row">
              <label>Chapter</label>
              <select value={selectedChapter} onChange={(event) => handleChapterChange(event.target.value)}>
                {currentSection.chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
                ))}
              </select>
            </div>

            <div className="field-row">
              <label>Topic</label>
              <select value={selectedTopic} onChange={(event) => setSelectedTopic(event.target.value)}>
                {topicOptions.map((topic) => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            <div className="field-row question-field">
              <label>No. of Questions</label>
              <input type="number" min="1" max="50" value={questionCount} onChange={(event) => setQuestionCount(event.target.value)} />
            </div>
          </div>

          <button className="start-practice-button" type="button" onClick={handleStartPractice}>Start My Practice</button>
          {apiError && <p className="api-error" role="alert">{apiError}</p>}
        </section>
      </div>
    </div>
  );

  const renderPracticePage = () => (
    <div className="page-shell">
      <div className="page-header">
        <button type="button" className="back-link" onClick={handleBackToDashboard}>← Back</button>
        <h2>Practice Session</h2>
      </div>

      <div className="page-content practice-page-card">
        {practiceSubmitted && practiceResult ? (
          <div className="result-card">
            <div className="result-header">
              <h2>Practice Result</h2>
              <button type="button" className="secondary-button" onClick={handleBackToDashboard}>Back to Dashboard</button>
            </div>

            <div className="result-summary-grid">
              <div className="result-box">
                <span>Total</span>
                <strong>{practiceResult.summary.total}</strong>
              </div>
              <div className="result-box">
                <span>Attempted</span>
                <strong>{practiceResult.summary.attempted}</strong>
              </div>
              <div className="result-box">
                <span>Correct</span>
                <strong>{practiceResult.summary.correct}</strong>
              </div>
              <div className="result-box">
                <span>Accuracy</span>
                <strong>{practiceResult.summary.accuracy}%</strong>
              </div>
            </div>

            <div className="result-section">
              <h3>Difficulty Breakdown</h3>
              <div className="result-grid">
                {Object.entries(practiceResult.difficultyBreakdown).map(([level, stats]) => (
                  <div key={level} className="result-item">
                    <h4>{level}</h4>
                    <p>Questions: {stats.questions}</p>
                    <p>Correct: {stats.correct}</p>
                    <p>Incorrect: {stats.incorrect}</p>
                    <p>Skipped: {stats.skipped}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="result-section">
              <h3>Improvement Focus</h3>
              <div className="recommendation-card">
                <h4>{practiceResult.weakTopics[0].topic}</h4>
                <p>{practiceResult.weakTopics[0].reason}</p>
                <small>{practiceResult.weakTopics[0].action}</small>
              </div>
            </div>
          </div>
        ) : currentQuestion ? (
          <div className="practice-card">
            <div className="question-topbar">
              <div>
                <p className="question-meta">Question {currentPracticeIndex + 1} / {practiceQuestions.length}</p>
                <h2>{currentQuestion.topic}</h2>
              </div>
              <div className="question-topbar-right">
                <span className="question-badge">{currentQuestion.difficulty}</span>
                <div className="timer-display">
                  <span className="timer-label">Time on Question</span>
                  <span className="timer-value">{formatTime(currentQuestionTimer)}</span>
                </div>
              </div>
            </div>

            <h3 className="question-text">{currentQuestion.question}</h3>

            <div className="options-grid">
              {currentQuestion.options.map((option) => {
                const isSelected = practiceAnswers[currentPracticeIndex]?.selected === option;
                return (
                  <button
                    key={option}
                    type="button"
                    className={isSelected ? 'practice-option selected' : 'practice-option'}
                    onClick={() => handleAnswerSelect(option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="practice-actions">
              <span className="question-lock-note">Answers are final after Next</span>
              <span className="attempt-counter">Attempted: {attemptedCount} / {practiceQuestions.length}</span>
              {currentPracticeIndex < practiceQuestions.length - 1 ? (
                <button type="button" className="primary-button" onClick={handleNext} disabled={practiceAnswers[currentPracticeIndex]?.selected === null}>Next</button>
              ) : (
                <button type="button" className="primary-button" onClick={handleSubmitPractice} disabled={practiceAnswers[currentPracticeIndex]?.selected === null}>Submit</button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  const renderReportPage = () => {
    const currentAttempt = attempts.find((attempt) => attempt.id === selectedAttemptId) || attempts[0];
    const reportQuestions = currentAttempt?.questions || practiceQuestions || getQuestionsForTopic(selectedTopic, currentAttempt.totalQuestions || 10);
    const reportAnswers = currentAttempt?.answers || practiceAnswers || reportQuestions.map((question) => ({
      questionId: question.id,
      selected: Math.random() > 0.5 ? question.answer : question.options[0],
      correct: question.answer,
      difficulty: question.difficulty,
      topic: question.topic,
    }));
    const summary = practiceResult || currentAttempt?.result || buildPracticeResult(reportAnswers);
    const reportAccuracy = Number(summary?.summary?.accuracy) || 0;
    const reportAverageTime = Number(summary?.avgResponseTime) || 0;
    const recordedDurations = reportAnswers.map((answer) => Number(answer.duration)).filter((duration) => Number.isFinite(duration) && duration >= 0);
    const durationAverage = recordedDurations.length > 0
      ? recordedDurations.reduce((sum, duration) => sum + duration, 0) / recordedDurations.length
      : reportAverageTime;
    const durationVariance = recordedDurations.length > 1
      ? recordedDurations.reduce((sum, duration) => sum + ((duration - durationAverage) ** 2), 0) / recordedDurations.length
      : 0;
    const consistencyScore = Math.min(100, 100 / (1 + Math.sqrt(durationVariance)));
    const responseSpeedScore = Math.max(0, 100 - (durationAverage * 2));
    const learningVelocityScore = (reportAccuracy * 0.5) + (responseSpeedScore * 0.3) + (consistencyScore * 0.2);

    return (
      <div className="page-shell">
        <div className="page-header">
          <button type="button" className="back-link" onClick={handleBackToDashboard}>← Back</button>
          <h2>Practice Report</h2>
        </div>

        <div className="report-tabs">
          <button 
            type="button" 
            className={reportTab === 'analysis' ? 'report-tab-button active' : 'report-tab-button'}
            onClick={() => setReportTab('analysis')}
          >
            Analysis
          </button>
          <button 
            type="button" 
            className={reportTab === 'solution' ? 'report-tab-button active' : 'report-tab-button'}
            onClick={() => setReportTab('solution')}
          >
            Solution
          </button>
        </div>

        <div className="page-content report-page-card">
          {reportTab === 'analysis' ? (
            <>
              <div className="report-summary-top">
                <div>
                  <p className="report-label">Attempt</p>
                  <h3>{currentAttempt.label}</h3>
                </div>
                <div>
                  <p className="report-label">Date</p>
                  <h3>{formatDate(currentAttempt.createdOn)}</h3>
                </div>
                <div>
                  <p className="report-label">Section</p>
                  <h3>{currentAttempt.sectionName}</h3>
                </div>
              </div>

              <div className="result-summary-grid">
                <div className="result-box">
                  <span>Total</span>
                  <strong>{summary.summary.total}</strong>
                </div>
                <div className="result-box">
                  <span>Attempted</span>
                  <strong>{summary.summary.attempted}</strong>
                </div>
                <div className="result-box">
                  <span>Correct</span>
                  <strong>{summary.summary.correct}</strong>
                </div>
                <div className="result-box">
                  <span>Accuracy</span>
                  <strong>{summary.summary.accuracy}%</strong>
                </div>
              </div>

              {/* Time Spent Section */}
              <div className="analysis-section">
                <h3>Time Spent</h3>
                
                {/* Time Chart */}
                <div className="time-chart-section">
                  <h4>Time taken per question</h4>
                  <div className="chart-wrapper">
                    <svg className="time-chart-svg" viewBox="0 0 1200 350" preserveAspectRatio="xMidYMid meet">
                      {/* Grid lines */}
                      {[0, 50, 100, 150, 200, 250].map((y) => (
                        <line key={`grid-${y}`} x1="60" y1={300 - y} x2="1150" y2={300 - y} stroke="#e0e0e0" strokeDasharray="2,2" strokeWidth="1" />
                      ))}
                      
                      {/* Y-axis labels */}
                      {[0, 50, 100, 150, 200, 250].map((y) => (
                        <text key={`label-${y}`} x="45" y={300 - y + 5} fontSize="12" textAnchor="end" fill="#666">
                          {y}
                        </text>
                      ))}

                      {/* X-axis */}
                      <line x1="60" y1="300" x2="1150" y2="300" stroke="#333" strokeWidth="2" />
                      
                      {/* Y-axis */}
                      <line x1="60" y1="20" x2="60" y2="300" stroke="#333" strokeWidth="2" />

                      {/* Y-axis label */}
                      <text x="20" y="150" fontSize="12" fill="#666" textAnchor="middle" transform="rotate(-90, 20, 150)">
                        Time Taken
                      </text>

                      {/* Bars for each question */}
                      {practiceQuestions.map((question, index) => {
                        const mockTime = generateMockTime(question.difficulty);
                        const barWidth = 25;
                        const spacing = (1090) / practiceQuestions.length;
                        const x = 60 + (index * spacing) + (spacing - barWidth) / 2;
                        const barHeight = (mockTime / 250) * 280;
                        const isCorrect = practiceAnswers[index]?.selected === practiceAnswers[index]?.correct;
                        const isSkipped = practiceAnswers[index]?.selected === null;
                        const barColor = isCorrect ? '#4caf50' : isSkipped ? '#ffb74d' : '#ff6a6a';

                        return (
                          <g key={`bar-${index}`}>
                            <rect x={x} y={300 - barHeight} width={barWidth} height={barHeight} fill={barColor} opacity="0.85" rx="3" />
                            <text x={x + barWidth / 2} y="320" fontSize="11" textAnchor="middle" fill="#333" fontWeight="500">
                              Q{index + 1}
                            </text>
                          </g>
                        );
                      })}

                      {/* X-axis label */}
                      <text x="600" y="340" fontSize="12" textAnchor="middle" fill="#666">
                        Question no.
                      </text>
                    </svg>
                  </div>
                  
                  {/* Legend */}
                  <div className="time-legend">
                    <div className="legend-item">
                      <span className="legend-color" style={{ backgroundColor: '#4caf50' }}></span>
                      <span>Correct</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color" style={{ backgroundColor: '#ff6a6a' }}></span>
                      <span>Incorrect</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-color" style={{ backgroundColor: '#ffb74d' }}></span>
                      <span>Skipped</span>
                    </div>
                  </div>
                </div>

                {/* Time Statistics */}
                <div className="time-statistics">
                  <div className="stat-card">
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-content">
                      <h5>Total Time Spent</h5>
                      <p className="stat-value">{summary.totalTime || 0} sec</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">⏰</div>
                    <div className="stat-content">
                      <h5>Average Time Per Question</h5>
                      <p className="stat-value">{summary.avgResponseTime || 0} sec</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Difficulty Level Section */}
              <div className="difficulty-section">
                <h3>Difficulty level</h3>
                <div className="difficulty-grid">
                  {Object.entries(summary.difficultyBreakdown).map(([level, stats]) => (
                    <div key={level} className={`difficulty-card difficulty-${level.toLowerCase()}`}>
                      <h4>{level}</h4>
                      <div className="difficulty-stats">
                        <div className="stat-row">
                          <span className="stat-label">Correct</span>
                          <span className="stat-number correct-stat">{stats.correct}</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">Incorrect</span>
                          <span className="stat-number incorrect-stat">{stats.incorrect}</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">Skipped</span>
                          <span className="stat-number skipped-stat">{stats.skipped}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Velocity Index Analytics */}
              <div className="analytics-section">
                <h3>Learning Velocity Index</h3>
                <div className="lvi-analytics">
                  <div className="lvi-card">
                    <span className="lvi-label">Accuracy</span>
                    <div className="lvi-value-box">
                      <span className="lvi-value">{reportAccuracy.toFixed(1)}%</span>
                    </div>
                    <div className="lvi-bar">
                      <div className="lvi-fill" style={{ width: `${reportAccuracy}%`, backgroundColor: '#4caf50' }}></div>
                    </div>
                  </div>
                  <div className="lvi-card">
                    <span className="lvi-label">Response Speed</span>
                    <div className="lvi-value-box">
                      <span className="lvi-value">{durationAverage.toFixed(1)}s avg</span>
                    </div>
                    <div className="lvi-bar">
                      <div className="lvi-fill" style={{ width: `${responseSpeedScore}%`, backgroundColor: '#2196f3' }}></div>
                    </div>
                  </div>
                  <div className="lvi-card">
                    <span className="lvi-label">Consistency</span>
                    <div className="lvi-value-box">
                      <span className="lvi-value">{consistencyScore.toFixed(1)}%</span>
                    </div>
                    <div className="lvi-bar">
                      <div className="lvi-fill" style={{ width: `${consistencyScore}%`, backgroundColor: '#ff9800' }}></div>
                    </div>
                  </div>
                  <div className="lvi-card">
                    <span className="lvi-label">Learning Velocity</span>
                    <div className="lvi-value-box lvi-score">
                      <span className="lvi-value">{learningVelocityScore.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fatigue Analysis */}
              <div className="analytics-section">
                <h3>Fatigue Analysis</h3>
                <p className="fatigue-description">Performance trend across question groups</p>
                <div className="fatigue-grid">
                  {(() => {
                    const groupSize = 5;
                    const groups = [];
                    for (let i = 0; i < reportQuestions.length; i += groupSize) {
                      const groupQuestions = reportQuestions.slice(i, Math.min(i + groupSize, reportQuestions.length));
                      const groupAnswers = reportAnswers.slice(i, Math.min(i + groupSize, reportAnswers.length));
                      const correctInGroup = groupAnswers.filter(a => a.selected === a.correct).length;
                      const accuracyInGroup = (correctInGroup / groupQuestions.length) * 100;
                      const avgTimeInGroup = groupAnswers.reduce((sum, answer) => sum + (Number(answer.duration) || 0), 0) / Math.max(1, groupAnswers.length);
                      groups.push({
                        label: `Q${i + 1}-${Math.min(i + groupSize, reportQuestions.length)}`,
                        accuracy: accuracyInGroup,
                        avgTime: avgTimeInGroup,
                      });
                    }
                    return groups.map((group, idx) => (
                      <div key={idx} className="fatigue-card">
                        <span className="fatigue-group">{group.label}</span>
                        <div className="fatigue-metrics">
                          <div className="fatigue-metric">
                            <span className="metric-label">Accuracy</span>
                            <span className="metric-value">{group.accuracy.toFixed(0)}%</span>
                          </div>
                          <div className="fatigue-metric">
                            <span className="metric-label">Avg Time</span>
                            <span className="metric-value">{group.avgTime.toFixed(1)}s</span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div className="result-section">
                <h3>Improvement Focus</h3>
                <div className="recommendation-card">
                  <h4>{summary.weakTopics[0].topic}</h4>
                  <p>{summary.weakTopics[0].reason}</p>
                  <small>{summary.weakTopics[0].action}</small>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="solutions-header">
                <h2>Question Solutions</h2>
                <p>Review one question at a time with the explanation and answer breakdown.</p>
              </div>

              <div className="solutions-list">
                {practiceQuestions.length > 0 ? (() => {
                  const question = practiceQuestions[solutionIndex];
                  const answer = practiceAnswers[solutionIndex];
                  const isCorrect = answer?.selected === answer?.correct;
                  const isSkipped = answer?.selected === null;
                  const timeSpent = (Number(answer?.duration) || 0).toFixed(1);

                  return (
                    <div className={`solution-card ${isCorrect ? 'correct' : isSkipped ? 'skipped' : 'incorrect'}`}>
                      <div className="solution-header">
                        <div className="solution-question-info">
                          <span className="solution-question-num">Q {solutionIndex + 1}</span>
                          <span className={`solution-status ${isCorrect ? 'status-correct' : isSkipped ? 'status-skipped' : 'status-incorrect'}`}>
                            {isCorrect ? '✓ Correct' : isSkipped ? '⊘ Skipped' : '✗ Incorrect'}
                          </span>
                          <span className="solution-time">Time: {timeSpent}s</span>
                        </div>
                        <span className={`solution-difficulty ${question.difficulty.toLowerCase()}`}>{question.difficulty}</span>
                      </div>

                      <div className="solution-section">
                        <h4 className="solution-section-title">Question</h4>
                        <p className="solution-question-text">{question.question}</p>
                      </div>

                      <div className="solution-section">
                        <h4 className="solution-section-title">Your Answer & Correct Answer</h4>
                        <div className="solution-options">
                          {question.options.map((option) => {
                            const isUserAnswer = answer?.selected === option;
                            const isCorrectAnswer = option === answer?.correct;
                            let className = 'solution-option';

                            if (isCorrectAnswer) className += ' correct-answer';
                            if (isUserAnswer && !isCorrect) className += ' user-incorrect';

                            return (
                              <div key={option} className={className}>
                                <div className="solution-option-label">
                                  {isUserAnswer && !isCorrect && <span className="badge wrong">Your Answer</span>}
                                  {isCorrectAnswer && <span className="badge right">Correct Answer</span>}
                                </div>
                                <div className="solution-option-text">{option}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {question.explanation && (
                        <div className="solution-section">
                          <h4 className="solution-section-title">Solution & Explanation</h4>
                          <div className="solution-explanation">
                            <p>{question.explanation}</p>
                          </div>
                        </div>
                      )}

                      <div className="solution-meta">
                        <span className="meta-item">Time Spent: <strong>{timeSpent}s</strong></span>
                        <span className="meta-item">Topic: <strong>{question.topic}</strong></span>
                      </div>

                      <div className="solution-navigation">
                        <button
                          type="button"
                          className="solution-next-button"
                          disabled={solutionIndex >= practiceQuestions.length - 1}
                          onClick={() => setSolutionIndex((prev) => Math.min(prev + 1, practiceQuestions.length - 1))}
                        >
                          {solutionIndex === practiceQuestions.length - 1 ? 'Last Question' : 'Next'}
                        </button>
                      </div>
                    </div>
                  );
                })() : null}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="login-shell">
        <div className="login-card">
          <div className="login-header">
            <div className="login-badge">A</div>
            <h1>Practice Portal</h1>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <label>
              User ID
              <input
                type="text"
                value={loginForm.email}
                onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                placeholder="user-001"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                placeholder="••••••••"
              />
            </label>

            <button type="submit" className="login-button">Login</button>
          </form>
        </div>
      </div>
    );
  }

  if (screen === 'practice') {
    return renderPracticePage();
  }

  if (screen === 'report') {
    return renderReportPage();
  }

  return renderDashboard();
}

export default App;
