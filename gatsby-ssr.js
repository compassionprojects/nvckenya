const React = require('react');
const Layout = require('./src/components/Layout').default;

// Adds a class name to the body element
exports.onRenderBody = ({ setBodyAttributes }) => {
  setBodyAttributes({
    className: 'nvckenya',
  });
};

// Wraps every page in a component
exports.wrapPageElement = ({ element, props }) => {
  return <Layout {...props}>{element}</Layout>;
};
