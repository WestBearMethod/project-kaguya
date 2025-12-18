import { Layer } from "effect";
import { DeleteDescription } from "@/application/description/deleteDescription";
import { GetDescriptionContent } from "@/application/description/getDescriptionContent";
import { GetDescriptions } from "@/application/description/getDescriptions";
import { SaveDescription } from "@/application/description/saveDescription";
import { DatabaseServiceLive } from "@/infrastructure/db/service";
import { DescriptionRepositoryLive } from "@/infrastructure/description/DescriptionRepository.live";

export const UseCasesLive = Layer.mergeAll(
  SaveDescription.Live,
  GetDescriptions.Live,
  GetDescriptionContent.Live,
  DeleteDescription.Live,
);

export const AppLayerContext = UseCasesLive.pipe(
  Layer.provide(DescriptionRepositoryLive),
);

export const AppLayer = AppLayerContext.pipe(
  Layer.provide(DatabaseServiceLive),
);
