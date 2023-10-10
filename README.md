# multisetups

For production use, Groth16 zk-SNARK circuits require a multi-party trusted
setup to generate the proving and verifying key fo reach circuit, while
reducing the probability that the toxic waste associated with the keys has been
retained. While there already exist ([1](https://github.com/briangu33/Setup),
[2](https://github.com/glamperd/setup-mpc-ui),
[3](https://github.com/celo-org/snark-setup/)) which help teams to automate
this process, so far none exist that support this combination of requirements:

1. Multiple circuits per ceremony (e.g. [MACI](https://github.com/appliedzkp/maci))
2. Large circuits (more than 1 million constraints) that cannot be set up in a
   browser

The `multisetups` utility seeks to meet them with the following goals in mind:

1. Simplicity:

    - Rather than automate away the role of a central coordinator, a
      coordinator is needed to verify contributions and pass the baton on to
      the next participant. Moreover, doing so reduces the time and cost of
      development.

2. Ease of use for contributors:

    - Contributors should only have to run a few commands to participate in
      the ceremony. Moreover, the software will be Dockerised for maximum
      ease-of-use.

3. Low infrastructure overhead:

    - Contribution files should be transferred via IPFS, so it is not necessary
      to provision cloud machines for the ceremony. As long as the coordinator
      has high bandwidth and storage, they can run the ceremony from their own
      machine.

# Usage
Steps on how to build this repo from Docker, as well as how to contribute to Zephyr's 
zkeys, can be found on our gitbook.