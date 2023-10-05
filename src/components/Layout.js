import * as React from 'react';
import PropTypes from 'prop-types';
import Footer from '../components/Footer';
import './layout.scss';

const Layout = ({ children }) => {
  return (
    <div className="container-fluid">
      <main>
        {children}
        <Footer />
      </main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
