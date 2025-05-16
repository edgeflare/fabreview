# build ui
FROM docker.io/node:22.12.0-alpine3.21 as ui-builder
WORKDIR /ui
COPY webui/package.json webui/package-lock.json ./
RUN npm install --force
COPY webui .
RUN npx ng build ng-essential && npx ng build

# build go
FROM docker.io/golang:1.24 AS builder
ARG TARGETOS
ARG TARGETARCH

WORKDIR /workspace

COPY ./go.mod ./go.sum ./

RUN go mod download

COPY --from=ui-builder /ui/dist /workspace/dist
COPY webui/server.go ./

RUN CGO_ENABLED=0 GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH} go build -a -o fabreview-ui .

# runtime image
FROM gcr.io/distroless/static:nonroot
WORKDIR /
COPY --from=builder /workspace/fabreview-ui ./
USER 65532:65532

ENTRYPOINT ["/fabreview-ui"]
CMD ["-spa", "-embed"]
