ARG PGT_IMAGE=pablaofficeal/pgt-language:latest
FROM ${PGT_IMAGE}

WORKDIR /app
COPY . .

EXPOSE 5000
CMD ["run", "main.pgt"]
