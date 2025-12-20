import { Layer } from "effect";
import { DeleteUser } from "@/application/user/deleteUser";
import {
  DescriptionReaderLive,
  DescriptionWriterLive,
} from "@/description/application/DescriptionRepository.live";
import { DeleteDescription } from "@/description/application/deleteDescription";
import { GetDescriptionContent } from "@/description/application/getDescriptionContent";
import { GetDescriptions } from "@/description/application/getDescriptions";
import { SaveDescription } from "@/description/application/saveDescription";
import { DatabaseServiceLive } from "@/infrastructure/db/service";
import {
  UserReaderLive,
  UserWriterLive,
} from "@/infrastructure/user/UserRepository/UserRepository.live";

export const UseCasesLive = Layer.mergeAll(
  SaveDescription.Live,
  GetDescriptions.Live,
  GetDescriptionContent.Live,
  DeleteDescription.Live,
  DeleteUser.Live,
);

export const AppLayerContext = UseCasesLive.pipe(
  Layer.provide(
    Layer.mergeAll(
      DescriptionReaderLive,
      DescriptionWriterLive,
      UserReaderLive,
      UserWriterLive,
    ),
  ),
);

export const AppLayer = AppLayerContext.pipe(
  Layer.provide(DatabaseServiceLive),
);
