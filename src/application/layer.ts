import { Layer } from "effect";
import { DeleteDescription } from "@/application/description/deleteDescription";
import { GetDescriptionContent } from "@/application/description/getDescriptionContent";
import { GetDescriptions } from "@/application/description/getDescriptions";
import { SaveDescription } from "@/application/description/saveDescription";
import { DatabaseServiceLive } from "@/infrastructure/db/service";
import { DescriptionRepositoryLive } from "@/infrastructure/description/DescriptionRepository.live";

// Compose the full application layer
// UseCases depend on Repository.
// Repositories depend on DatabaseService.
// This layer requires DatabaseService to be provided.
export const AppLayerContext = Layer.mergeAll(
  SaveDescription.Live,
  GetDescriptions.Live,
  GetDescriptionContent.Live,
  DeleteDescription.Live,
).pipe(Layer.provide(DescriptionRepositoryLive));

// The Live layer with real database
export const AppLayer = AppLayerContext.pipe(
  Layer.provide(DatabaseServiceLive),
);
