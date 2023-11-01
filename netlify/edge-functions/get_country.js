export default async (req, { geo }) => {
  return Response.json({ country: geo?.country?.code });
};

export const config = { path: '/api/get_country' };
