import { Font } from '@react-pdf/renderer';

// Register Hebrew font for PDF
Font.register({
  family: 'David',
  src: '/fonts/david.ttf',
  // src: 'https://fonts.gstatic.com/s/assistant/v19/2sDPZGJYnIjSi6H75xkZZE1I0yCmYzzQtuZnEGGf3qGuvM4.ttf'
});

// Register bold variant
Font.register({
  family: 'David-Bold',
  src: 'https://fonts.gstatic.com/s/assistant/v19/2sDPZGJYnIjSi6H75xkZZE1I0yCmYzzQtjhgEGGf3qGuvM4.ttf',
});
