# docker-build-cache
> Depends 
>
> - node20

Create a temporary container to restore code dependencies and cache them with actions/cache to speed up mirror building.



## Example

### Directory structure

```
.github
  - workflows
  	- build.yml
src
  - vue-project
    - Dockerfile
    - package-lock.json
    - ... other files ...
```

### build.yml

```yaml
name: "buildx"

on:
  push:

env:
  IMAGE_REGISTRY: ${{ vars.IMAGE_REGISTRY }}
  IMAGE_REGISTRY_USERNAME: ${{ vars.IMAGE_REGISTRY_USERNAME }}
  IMAGE_REGISTRY_PASSWORD: ${{ secrets.IMAGE_REGISTRY_PASSWORD }}

jobs:
  vue-project:
    runs-on: pwsh
    steps:
      - uses: actions/checkout@v4

      - uses: actions/docker-login-action@v3
        with:
          registry: ${{env.IMAGE_REGISTRY}}
          username: ${{env.IMAGE_REGISTRY_USERNAME}}
          password: ${{env.IMAGE_REGISTRY_PASSWORD}}

      - name: setup-cache
        uses: actions/cache@v4
        id: cache
        with:
          path: ./npm
          key: ${{ runner.os }}-build-cache-${{ hashFiles('**/package-lock.json') }}

      - name: restore-npm
      	if: ${{ steps.cache.outputs.cache-hit != 'true' }}
        uses: yihango/docker-build-cache@v1
        with:
          cache-image: node:16.13.2
          cache-container: build-cache-${{ hashFiles('**/packages.lock.json') }}
          cache-container-cmd: sleep 20m
          cache-source: ./npm
          cache-target: /root/.npm
          code-source: ./src/vue-project
          code-target: /code
          restore-cmd: npm ci

      - name: build-and-publish
        shell: pwsh
        run: |
          docker build . -f ./src/vue-project/Dockerfile `
            -t test:vue-project
```

### Dockerfile

```dockerfile
FROM node:16.13.2 as builder
WORKDIR /app

# 复制还原包
COPY ["./npm","/root"]
RUN ls -lha /root/.npm

# 复制代码
COPY ["./src/vue-project","."]

# 还原node_modules
RUN npm config get registry
RUN npm ci

# 编译项目
RUN npm run build
RUN echo "build is success"
```



## Stargazers over time

[![Stargazers over time](https://starchart.cc/yihango/docker-build-cache.svg)](https://starchart.cc/yihango/docker-build-cache)
