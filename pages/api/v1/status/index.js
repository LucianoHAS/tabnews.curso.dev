function status(request, response) {
  response.status(200).json({ mesage: "São acima da média" });
}

export default status;
