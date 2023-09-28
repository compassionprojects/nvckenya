import React from 'react';

export default function Nav() {
  return (
    <nav
      id="navbar"
      className="sticky-top bg-body navbar-expand overflow-x-scroll hide-scrollbars border-bottom">
      <ul className="nav nav-underline nav-fill flex-nowrap">
        <li className="nav-item pt-3">
          <a className="nav-link pb-3" href="#program">
            Program
          </a>
        </li>
        <li className="nav-item pt-3">
          <a className="nav-link pb-3" href="#team">
            Team
          </a>
        </li>
        <li className="nav-item pt-3">
          <a className="nav-link pb-3" href="#pricing">
            Pricing
          </a>
        </li>
        <li className="nav-item pt-3">
          <a className="nav-link pb-3" href="#cancellations">
            Cancellations
          </a>
        </li>
        <li className="nav-item pt-3">
          <a className="nav-link pb-3" href="#accommodation">
            Accommodation
          </a>
        </li>
        <li className="nav-item pt-3 flex-shrink-0">
          <a className="nav-link pb-3" href="#travel">
            Getting there
          </a>
        </li>
        <li className="nav-item pt-3">
          <a className="nav-link pb-3" href="#registrations">
            Registrations
          </a>
        </li>
      </ul>
    </nav>
  );
}
