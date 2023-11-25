FROM node:15.8.0-buster

# Install dependencies for AWS CLI installation
RUN apt-get update && apt-get install -y unzip less groff

# Determine architecture and download appropriate AWS CLI version
RUN ARCHITECTURE=""; \
    case $(uname -m) in \
        x86_64) ARCHITECTURE='x86_64' ;; \
        aarch64) ARCHITECTURE='aarch64' ;; \
        *) echo "Unsupported architecture" && exit 1 ;; \
    esac && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-$ARCHITECTURE.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install

# Build the multisetups package
WORKDIR /multisetups
COPY . /multisetups/
RUN npm install
