export default function({ store, error }) {
  const { user } = store.state.user;

  if (!user || "admin" !== user.role) {
    error({
      statusCode: 404,
    });
  }
}
