FROM postgres:latest

ENV POSTGRES_USER postgres
ENV POSTGRES_PASSWORD password
ENV POSTGRES_DB ocis-identity-db

EXPOSE 5432

CMD ["postgres"]
