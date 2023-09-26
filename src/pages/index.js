import * as React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import classnames from 'classnames';
import { marked } from 'marked';

// get the latest retreat by sorting latest
export const query = graphql`
  query {
    allRetreatsYaml(sort: { start_date: ASC }) {
      edges {
        node {
          intro
          title
          contact_email
          start_date
          end_date
          hero_image {
            publicURL
          }
          program {
            introduction
            details
            goals
            pricing
            cancellation_policy
            accommodation_details
            accommodation_photo {
              publicURL
            }
            facilities
            location
            trainers
            organisers
            travel
          }
        }
      }
    }
    allTeamYaml {
      edges {
        node {
          id
          title
          bio
          role
          photo {
            publicURL
          }
        }
      }
    }
  }
`;

export default function Home({ data }) {
  console.log(marked);
  // display the latest retreat
  const { title, intro, contact_email, hero_image, program } =
    data.allRetreatsYaml.edges[0].node;
  const people = data.allTeamYaml.edges.map((e) => e.node);
  const trainers = people.filter((p) => program.trainers.includes(p.title));
  const organisers = people.filter((p) => program.organisers.includes(p.title));

  return (
    <>
      <Section center>
        <h1 className="display-4 fw-bold text-body-emphasis">{title}</h1>
        <div className="col-lg-6 mx-auto">
          <p className="lead my-4">{intro}</p>
          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mb-5">
            <Register />
            <a href="#program" className="btn btn-link btn-lg">
              Learn more
            </a>
          </div>
        </div>
        <div style={{ maxHeight: '30vh' }}>
          <div className="container px-lg-5">
            <img
              src={hero_image.publicURL}
              className="img-fluid rounded-3 shadow-lg mb-4"
              alt="Hero Image"
              width={800}
              loading="lazy"
            />
          </div>
        </div>
      </Section>
      <nav
        id="navbar"
        className="sticky-top bg-body navbar-expand overflow-x-scroll hide-scrollbars">
        <ul className="nav nav-underline nav-fill flex-nowrap">
          <li className="nav-item pt-3">
            <a className="nav-link pb-3" href="#program">
              Program
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
          <li className="nav-item pt-3">
            <a className="nav-link pb-3" href="#team">
              Team
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
      <div
        data-bs-spy="scroll"
        data-bs-target="#navbar"
        data-bs-root-margin="0px 0px -40%"
        data-bs-smooth-scroll="false">
        <Section id="program">
          <h1 className="text-center fw-bold">Program</h1>
          <div className="col-lg-6 mx-auto my-3">
            <div
              dangerouslySetInnerHTML={{
                __html: marked.parse(program.introduction),
              }}
            />
          </div>
          <div className="col-lg-6 mx-auto my-5">
            <h2 className="text-center">Details</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: marked.parse(program.details),
              }}
            />
          </div>
          <div className="col-lg-6 mx-auto my-5">
            <h2 className="text-center">Goals</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: marked.parse(program.goals),
              }}
            />
          </div>
          <div className="text-center mt-5 mb-4">
            <Register />
          </div>
        </Section>

        {/* Pricing */}
        <Section id="pricing">
          <h1 className="text-center fw-bold">Pricing</h1>
          <div
            className="col-lg-6 mx-auto my-3"
            dangerouslySetInnerHTML={{ __html: marked.parse(program.pricing) }}
          />
          <div className="text-center mt-5 mb-4">
            <Register />
          </div>
        </Section>

        {/* Cancellations */}
        <Section id="cancellations">
          <h1 className="text-center fw-bold">
            Cancellation and refund policy
          </h1>
          <div
            className="col-lg-6 mx-auto my-3"
            dangerouslySetInnerHTML={{
              __html: marked.parse(program.cancellation_policy),
            }}
          />
          <div className="text-center mt-5 mb-4">
            <Register />
          </div>
        </Section>

        {/* Accommodation */}
        <Section id="accommodation">
          <h1 className="text-center fw-bold">Accommodation</h1>
          <div className="col-lg-6 mx-auto my-3">
            <div
              dangerouslySetInnerHTML={{
                __html: marked.parse(program.accommodation_details),
              }}
            />
          </div>
          <div className="container px-lg-5 text-center">
            <img
              src={program.accommodation_photo.publicURL}
              className="img-fluid rounded-3 shadow-lg mb-4 my-3"
              alt="Hero Image"
              width={700}
              loading="lazy"
            />
          </div>
          <div className="col-lg-6 mx-auto my-5">
            <h2 className="text-center">Facilities</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: marked.parse(program.facilities),
              }}
            />
          </div>
          <div className="col-lg-6 mx-auto my-5">
            <h2 className="text-center">Location</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: marked.parse(program.location),
              }}
            />
          </div>
          <div className="text-center mt-5 mb-4">
            <Register />
          </div>
        </Section>

        {/* Team */}
        <Section id="team">
          <h1 className="text-center fw-bold">Team</h1>
          <div className="col-lg-8 mx-auto my-3">
            <div className="row">
              {trainers.map((trainer) => (
                <Person key={trainer.id} data={trainer} />
              ))}
            </div>
          </div>

          <div className="col-lg-8 mx-auto my-5">
            <h2 className="text-center">Organisers team</h2>
            <div className="row">
              {organisers.map((organiser) => (
                <Person key={organiser.id} data={organiser} />
              ))}
            </div>
          </div>
          <div className="text-center mt-5 mb-4">
            <Register />
          </div>
        </Section>

        {/* Travel */}
        <Section id="travel">
          <h1 className="text-center fw-bold">Getting there</h1>
          <div className="col-lg-6 mx-auto my-3">
            <div
              dangerouslySetInnerHTML={{
                __html: marked.parse(program.travel),
              }}
            />
          </div>
        </Section>

        {/* Registrations */}
        <Section id="registrations">
          <h1 className="text-center fw-bold">Register</h1>
          <div className="col-lg-6 mx-auto my-3">
            <a href={`mailto:${contact_email}`} className="btn btn-secondary">
              Contact us
            </a>
          </div>
        </Section>
      </div>
    </>
  );
}

Home.propTypes = {
  data: PropTypes.object,
};

export const Head = () => <title>NVC Kenya</title>;

function Section({ center, prewrap, ...props }) {
  return (
    <section
      style={{ whiteSpace: prewrap ? 'pre-wrap' : 'normal' }}
      className={classnames('px-2 py-5 my-5 border-bottom', {
        'text-center': center,
      })}
      {...props}
    />
  );
}

Section.propTypes = {
  center: PropTypes.bool,
  prewrap: PropTypes.bool,
};

function Person({ data }) {
  return (
    <div className="col-lg-3 col-md-4 col-6 text-center" key={data.id}>
      <div className="px-3">
        <img
          src={data.photo.publicURL}
          alt={data.name}
          className="rounded img-fluid"
        />
      </div>
      <div className="fw-bold my-2">{data.title}</div>
      <p>{data.role}</p>
    </div>
  );
}

Person.propTypes = {
  data: PropTypes.object,
};

function Register() {
  return (
    <a href="#registrations" className="btn btn-primary btn-lg">
      Register
    </a>
  );
}
