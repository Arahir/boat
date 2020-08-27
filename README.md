# Gestion des stocks

## Comment lancer le projet?

en dev :

```bash
yarn install
yarn dev
```

en "prod":

```bash
bash start.sh
```

troubleshot:

- si le fichier n'est pas exécutable:

  ```bash
  sudo chmod 755 start.sh
  ```

L'api est disponible à l'url http://localhost:8080

## Les test

```bash
  yarn test
```

## L'algorithme

#### 1) Travaille préparatoire

Prenons cette exemple:

```js
{
  billing_period: {
    from_date: "2020-12-30",
    to_date: "2020-12-31",
  },
  daily_inventory: {
    "2020-12-30": [
      { product: "BGBL-TSHIRT-BLUS", quantity: 9 },
      { product: "BGBL-TSHIRT-BLUM", quantity: 15 },
      { product: "BGBL-TSHIRT-BLUL", quantity: 90 },
    ],
    "2020-12-31": [
      { product: "BGBL-TSHIRT-BLUS", quantity: 9 },
      { product: "BGBL-TSHIRT-BLUM", quantity: 15 },
      { product: "BGBL-TSHIRT-BLUL", quantity: 33 },
    ],
  },
  inbound_shipments: [
    {
      id: "BGBLINEU00001",
      lines: [
        { product: "BGBL-TSHIRT-BLUS", quantity: 3 },
        { product: "BGBL-TSHIRT-BLUM", quantity: 15 },
        { product: "BGBL-TSHIRT-BLUL", quantity: 30 },
      ],
      offload_complete_time: "2020-12-01T13:00:00Z",
    },
    {
      id: "BGBLINEU00001",
      lines: [
        { product: "BGBL-TSHIRT-BLUS", quantity: 2 },
        { product: "BGBL-TSHIRT-BLUL", quantity: 31 },
      ],
      offload_complete_time: "2020-12-11T13:00:00Z",
    },
    {
      id: "BGBLINEU00001",
      lines: [
        { product: "BGBL-TSHIRT-BLUS", quantity: 4 },
        { product: "BGBL-TSHIRT-BLUL", quantity: 30 },
      ],
      offload_complete_time: "2020-12-21T13:00:00Z",
    },
    {
      id: "BGBLINEU00001",
      lines: [
        { product: "BGBL-TSHIRT-BLUS", quantity: 3 },
        { product: "BGBL-TSHIRT-BLUL", quantity: 34 },
      ],
      offload_complete_time: "2021-01-21T13:00:00Z",
    },
  ],
  products: [
    { id: "BGBL-TSHIRT-BLUS", size: "S", create_time: "2020-11-01T13:22:33Z" },
    { id: "BGBL-TSHIRT-BLUM", size: "M", create_time: "2020-10-01T13:11:31Z" },
    { id: "BGBL-TSHIRT-BLUL", size: "L", create_time: "2020-10-01T13:11:31Z" },
  ],
}
```

- _dataToDescription_ permet de valider les champs de premiers niveaux et de parser la donnée

- _getSizeByProduct_ permet de faire correspondre la référence produit et sa taille

  ```js
  # sizeByProduct
  {
    'BGBL-TSHIRT-BLUS': 'S',
    'BGBL-TSHIRT-BLUM': 'M',
    'BGBL-TSHIRT-BLUL': 'L'
  }
  ```

- getStock permet de connaître le nombre de produit disponible par inboundShipment

  ```js
  {
    'BGBL-TSHIRT-BLUS': {
      perDate: {
        '2020-12-01': 3,
        '2020-12-11': 2,
        '2020-12-21': 4,
        '2021-01-21': 3
      },
      inboundShipments: [
        2020-12-21T00:00:00.000Z,
        2020-12-11T00:00:00.000Z,
        2020-12-01T00:00:00.000Z
      ]
    },
    'BGBL-TSHIRT-BLUM': {
      perDate: { '2020-12-01': 15 },
      inboundShipments: [ 2020-12-01T00:00:00.000Z ]
    },
    'BGBL-TSHIRT-BLUL': {
      perDate: {
        '2020-12-01': 30,
        '2020-12-11': 31,
        '2020-12-21': 30,
        '2021-01-21': 34
      },
      inboundShipments: [
        2020-12-21T00:00:00.000Z,
        2020-12-11T00:00:00.000Z,
        2020-12-01T00:00:00.000Z
      ]
    }
  }
  ```

  les inboundShipments sont ordonnées par date décroissantes avant de facilité la logique fifo

#### 2) Le prix total

```
// Pour chaque jour de la billing period (ex "2020-12-20")
  // Pour chaque Produit de l'inventaire du jour ex ({ product: "BGBL-TSHIRT-BLUS", quantity: 5 })
	// On récupère la taille du produit et le "stock" qui lui correspond:
		// size: S
		// {
            perDate: {
              '2020-12-01': 3,
              '2020-12-11': 2,
              '2020-12-21': 4,
              '2021-01-21': 3
            },
            inboundShipments: [
              2020-12-21T00:00:00.000Z,
              2020-12-11T00:00:00.000Z,
              2020-12-01T00:00:00.000Z
            ]
          }
		// on récupère les dates de shipment qui précéde la date actuelle ("2020-12-20")
		// [
              2020-12-11T00:00:00.000Z,
              2020-12-01T00:00:00.000Z
            ]
		// Pour chacun de ces shipments ex (2020-12-11)
			// on regarde le nombre de produit disponible (2)
			// on compare la date du shipment à la date de l'inventaire -> 9j
			// on calcule le prix 2 * 0 et on l'ajoute au prix total
		(pour le shipment suivant, le resultat serai 3 * 0.2 -> 0.6)
```

Les Défauts:

- j'aurai du utiliser un json validor comme https://github.com/tdegrunt/jsonschema pour la validation au lieu de le faire "manuellement"
- le code manque de commentaires et mériterai refacto
- tous les cas d'erreurs ne sont pas couverts dans les tests
- ajouter des tests d'intégration avec [Supertest](https://github.com/visionmedia/supertest) par exemple
